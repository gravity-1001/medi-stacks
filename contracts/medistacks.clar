;; Medi Stacks MVP - single-contract access control and monetization
;; Clarity v2

;; ------------------------------------
;; Constants and errors
;; ------------------------------------
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-RECORD-EXISTS (err u101))
(define-constant ERR-RECORD-NOT-FOUND (err u102))
(define-constant ERR-NOT-OWNER (err u103))
(define-constant ERR-BAD-EXPIRY (err u104))
(define-constant ERR-ROLE-NOT-ALLOWED (err u105))
(define-constant ERR-NO-PERMISSION (err u106))
(define-constant ERR-FEE-TOO-HIGH (err u107))
(define-constant ERR-NOT-RESEARCHER (err u108))
(define-constant ERR-NOT-DOCTOR (err u109))
(define-constant ERR-NOT-VERIFIER (err u110))
(define-constant ERR-REQUEST-NOT-FOUND (err u111))

(define-constant MAX-BPS u10000) ;; 100% in basis points

;; ------------------------------------
;; Admin and platform configuration
;; ------------------------------------
(define-data-var admin principal tx-sender)
(define-data-var platform-fee-bps uint u0)
(define-data-var fee-recipient principal tx-sender)

;; ------------------------------------
;; Role management
;; role is a small ASCII string, e.g. "doctor", "researcher", "emergency_responder", "verifier"
;; Only admin can grant/revoke admin & verifier. Admin or any verifier can grant other roles.
;; ------------------------------------
(define-map roles
  { addr: principal, role: (string-ascii 24) }
  { enabled: bool })

(define-read-only (has-role (addr principal) (role (string-ascii 24)))
  (default-to false (get enabled (map-get? roles { addr: addr, role: role }))))

(define-private (is-admin (addr principal))
  (is-eq addr (var-get admin)))

(define-public (set-role (addr principal) (role (string-ascii 24)) (enabled bool))
  (begin
    (asserts! (or (is-admin tx-sender)
                   (and (is-eq role "doctor") (has-role tx-sender "verifier"))
                   (and (is-eq role "researcher") (has-role tx-sender "verifier"))
                   (and (is-eq role "emergency_responder") (has-role tx-sender "verifier")))
             ERR-NOT-AUTHORIZED)
    ;; Only admin may change admin or verifier roles
    (asserts! (if (or (is-eq role "admin") (is-eq role "verifier"))
                  (is-admin tx-sender)
                  true) ERR-NOT-AUTHORIZED)
    (map-set roles { addr: addr, role: role } { enabled: enabled })
    (ok enabled)))

(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-admin tx-sender) ERR-NOT-AUTHORIZED)
    (var-set admin new-admin)
    (ok new-admin)))

(define-public (set-platform-fee-bps (bps uint))
  (begin
    (asserts! (is-admin tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (<= bps MAX-BPS) ERR-FEE-TOO-HIGH)
    (var-set platform-fee-bps bps)
    (ok bps)))

(define-public (set-fee-recipient (p principal))
  (begin
    (asserts! (is-admin tx-sender) ERR-NOT-AUTHORIZED)
    (var-set fee-recipient p)
    (ok p)))

;; ------------------------------------
;; Emergency mode - patient-level flag enabling ER access across their records
;; ------------------------------------
(define-map emergency-mode
  { patient: principal }
  { expiry-height: uint })

(define-public (enable-emergency (expiry-height uint))
  (begin
    (asserts! (> expiry-height block-height) ERR-BAD-EXPIRY)
    (map-set emergency-mode { patient: tx-sender } { expiry-height: expiry-height })
    (ok expiry-height)))

(define-read-only (get-emergency (patient principal))
  (map-get? emergency-mode { patient: patient }))

;; ------------------------------------
;; Records registry
;; record-id chosen by owner (e.g., increment or hash). Must be unique.
;; content-hash: 32-byte hash of encrypted blob. uri: pointer to off-chain storage.
;; ------------------------------------
(define-map records
  { record-id: uint }
  { owner: principal,
    content-hash: (buff 32),
    uri: (string-utf8 256),
    research-opt-in: bool,
    created-at: uint })

(define-read-only (get-record (record-id uint))
  (map-get? records { record-id: record-id }))

(define-public (register-record (record-id uint)
                                (content-hash (buff 32))
                                (uri (string-utf8 256))
                                (research-opt-in bool))
  (begin
    (asserts! (is-none (map-get? records { record-id: record-id })) ERR-RECORD-EXISTS)
    (map-set records { record-id: record-id }
      { owner: tx-sender,
        content-hash: content-hash,
        uri: uri,
        research-opt-in: research-opt-in,
        created-at: block-height })
    (ok record-id)))

(define-public (set-research-opt-in (record-id uint) (opt-in bool))
  (let ((rec (map-get? records { record-id: record-id })))
    (match rec r
      (begin
        (asserts! (is-eq (get owner r) tx-sender) ERR-NOT-OWNER)
        (map-set records { record-id: record-id }
          { owner: (get owner r),
            content-hash: (get content-hash r),
            uri: (get uri r),
            research-opt-in: opt-in,
            created-at: (get created-at r) })
        (ok opt-in))
      ERR-RECORD-NOT-FOUND)))

;; ------------------------------------
;; Access requests and permissions
;; ------------------------------------
(define-map access-requests
  { record-id: uint, requester: principal }
  { created-at: uint,
    purpose: (optional (string-utf8 80)),
    status: uint }) ;; 0=requested,1=approved,2=denied

(define-map permissions
  { record-id: uint, accessor: principal }
  { expiry-height: uint, ;; 0 means no expiry (perpetual)
    granted-by: principal,
    role-scope: (string-ascii 16) }) ;; e.g. "doctor" or "research"

(define-read-only (get-permission (record-id uint) (accessor principal))
  (map-get? permissions { record-id: record-id, accessor: accessor }))

(define-read-only (has-access (record-id uint) (accessor principal))
  (let (
        (rec (map-get? records { record-id: record-id }))
        (perm (map-get? permissions { record-id: record-id, accessor: accessor }))
       )
    (match rec r
      (let ((owner (get owner r)))
        (if (is-eq owner accessor)
            ;; Owner always has access
            (ok { allowed: true, expiry: u0 })
            (let ((now block-height))
              (match perm p
                (if (or (is-eq (get expiry-height p) u0)
                        (> (get expiry-height p) now))
                    (ok { allowed: true, expiry: (get expiry-height p) })
                    ;; check emergency mode as fallback
                    (let ((emer (map-get? emergency-mode { patient: owner })))
                      (match emer e
                        (if (and (> (get expiry-height e) now)
                                 (has-role accessor "emergency_responder"))
                            (ok { allowed: true, expiry: (get expiry-height e) })
                            (ok { allowed: false, expiry: u0 }))
                        (ok { allowed: false, expiry: u0 }))))
                ;; no direct permission; check emergency
                (let ((emer (map-get? emergency-mode { patient: owner })))
                  (match emer e
                    (if (and (> (get expiry-height e) block-height)
                             (has-role accessor "emergency_responder"))
                        (ok { allowed: true, expiry: (get expiry-height e) })
                        (ok { allowed: false, expiry: u0 }))
                    (ok { allowed: false, expiry: u0 })))))))
      ERR-RECORD-NOT-FOUND)))

(define-public (request-access (record-id uint)
                               (purpose (optional (string-utf8 80))))
  (begin
    (asserts! (is-some (map-get? records { record-id: record-id })) ERR-RECORD-NOT-FOUND)
    ;; Must be a doctor or researcher to request
    (asserts! (or (has-role tx-sender "doctor") (has-role tx-sender "researcher")) ERR-NOT-AUTHORIZED)
    (map-set access-requests { record-id: record-id, requester: tx-sender }
      { created-at: block-height, purpose: purpose, status: u0 })
    (ok true)))

(define-read-only (get-access-request (record-id uint) (requester principal))
  (map-get? access-requests { record-id: record-id, requester: requester }))

(define-private (record-owner (record-id uint))
  (let ((rec (map-get? records { record-id: record-id })))
    (match rec r
      (get owner r)
      'SP000000000000000000002Q6VF78))) ;; burn address fallback; shouldn't happen when guarded

(define-public (approve-access (record-id uint)
                               (accessor principal)
                               (expiry-height uint)
                               (role-scope (string-ascii 16)))
  (let ((owner (record-owner record-id)))
    (begin
      (asserts! (not (is-eq owner 'SP000000000000000000002Q6VF78)) ERR-RECORD-NOT-FOUND)
      (asserts! (is-eq owner tx-sender) ERR-NOT-OWNER)
      (asserts! (if (> expiry-height u0)
                    (> expiry-height block-height)
                    true) ERR-BAD-EXPIRY)
      (map-set permissions { record-id: record-id, accessor: accessor }
        { expiry-height: expiry-height, granted-by: tx-sender, role-scope: role-scope })
      ;; Mark request approved if exists
      (let ((req (map-get? access-requests { record-id: record-id, requester: accessor })))
        (match req r
          (map-set access-requests { record-id: record-id, requester: accessor }
                   { created-at: (get created-at r), purpose: (get purpose r), status: u1 })
          true))
      (ok true))))

(define-public (deny-access (record-id uint) (requester principal))
  (let ((owner (record-owner record-id)))
    (begin
      (asserts! (not (is-eq owner 'SP000000000000000000002Q6VF78)) ERR-RECORD-NOT-FOUND)
      (asserts! (is-eq owner tx-sender) ERR-NOT-OWNER)
      (let ((req (map-get? access-requests { record-id: record-id, requester: requester })))
        (match req r
          (map-set access-requests { record-id: record-id, requester: requester }
                   { created-at: (get created-at r), purpose: (get purpose r), status: u2 })
          false))
      (ok true))))

(define-public (revoke-access (record-id uint) (accessor principal))
  (let ((owner (record-owner record-id)))
    (begin
      (asserts! (not (is-eq owner 'SP000000000000000000002Q6VF78)) ERR-RECORD-NOT-FOUND)
      (asserts! (is-eq owner tx-sender) ERR-NOT-OWNER)
      (map-delete permissions { record-id: record-id, accessor: accessor })
      (ok true))))

;; ------------------------------------
;; Access audit metrics (coarse)
;; ------------------------------------
(define-map access-metrics
  { record-id: uint, accessor: principal }
  { count: uint, last-height: uint })

(define-public (record-access (record-id uint))
  (let ((ha (unwrap! (has-access record-id tx-sender) ERR-NO-PERMISSION)))
    (begin
      (asserts! (get allowed ha) ERR-NO-PERMISSION)
      (let ((m (map-get? access-metrics { record-id: record-id, accessor: tx-sender })))
        (match m prev
          (map-set access-metrics { record-id: record-id, accessor: tx-sender }
            { count: (+ u1 (get count prev)), last-height: block-height })
          (map-set access-metrics { record-id: record-id, accessor: tx-sender }
            { count: u1, last-height: block-height })))
      (ok true))))

(define-read-only (get-access-metrics (record-id uint) (accessor principal))
  (map-get? access-metrics { record-id: record-id, accessor: accessor }))

;; ------------------------------------
;; Research purchase flow (STX payments)
;; - Buyer must have role "researcher"
;; - Record must be opted-in
;; - Optional platform fee in BPS, sent to fee-recipient
;; ------------------------------------
(define-public (buy-research-access (record-id uint)
                                    (expiry-height uint)
                                    (amount uint))
  (let ((rec (map-get? records { record-id: record-id })))
    (match rec r
      (begin
        (asserts! (has-role tx-sender "researcher") ERR-NOT-RESEARCHER)
        (asserts! (get research-opt-in r) ERR-NOT-AUTHORIZED)
        (asserts! (if (> expiry-height u0)
                      (> expiry-height block-height)
                      true) ERR-BAD-EXPIRY)
        (let ((owner (get owner r))
              (bps (var-get platform-fee-bps))
              (recipient (var-get fee-recipient)))
          (let ((fee (/ (* amount bps) MAX-BPS))
                (to-owner (- amount fee)))
            (begin
              ;; Split payment
              (if (> fee u0)
                  (try! (stx-transfer? fee tx-sender recipient))
                  true)
              (try! (stx-transfer? to-owner tx-sender owner))
              ;; Grant permission
              (map-set permissions { record-id: record-id, accessor: tx-sender }
                { expiry-height: expiry-height,
                  granted-by: owner,
                  role-scope: "research" })
              (ok true)))))
      ERR-RECORD-NOT-FOUND)))

