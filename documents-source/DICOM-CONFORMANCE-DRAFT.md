# DICOM Camera DICOM Conformance Statement

**DRAFT - IMPLEMENTATION REVIEW PENDING**

Document ID: DCAM-DCS-001 | Revision: Draft 0.1 | Date: 24 September 2026

Product: DICOM Camera | Publisher: Raster Images

Product scope: DICOM Camera for iOS and Android. DICOM Camera Enterprise Manager is covered only as the described optional licensing and configuration integration; its server protocol is not declared as a DICOM service.

Reference structure: DICOM PS3.2 Annex N, as developed through Supplement 209. Reference standard edition reviewed: DICOM 2026d.

This is a populated engineering draft based on the product owner's descriptions. It is not an issued conformance declaration for a tested release. No source-code audit, protocol capture or interoperability test has been performed for this document. Product-level capabilities are distinguished from unresolved protocol declarations. **TBC means that evidence is required; it does not mean supported or unsupported.**

The numbered sections and annex subjects follow the current Annex N organisation. Detailed tables are working summaries pending implementation evidence. Before final issue, the required standard template text and applicable detailed tables must be reconciled with the official Annex N template, unresolved fields completed, and drafting notes removed. This draft does not claim complete formal template compliance.

## 1 Overview

DICOM Camera is a mobile acquisition application for clinical photographs and video. It associates captures or imported images with patient and study information and sends DICOM objects to a PACS or DICOM archive. Patient-first capture, Modality Worklist selection and Quick Take capture followed by demographic entry are described product workflows. Annotations may be represented as Presentation States or Structured Reports.

The product description includes traditional DICOM DIMSE connectivity and DICOMweb query, retrieval, storage and workflow services; optional MPPS; UPS/UPS-RS status handling; and DICOM Storage Commitment as an optional condition for local deletion. HL7/FHIR demographic queries and enterprise licence/configuration management are external integrations, not additional DICOM SOP Classes.

### 1.1 Content and transfer

Table 1-1 is a working content inventory. Created/read/stored/transferred capabilities must ultimately be declared per exact SOP Class and product version in the normative content/transfer table. Product language such as "photographs" or "annotations" is insufficient to select a SOP Class automatically.

| Described content | Known product-level behaviour | Release-specific declaration |
| --- | --- | --- |
| Clinical photographs | Captured in-app or imported from Photo Album; associated with patient/study information and uploaded. | SOP Class UID, created/read/displayed roles and transfer services: TBC. |
| Clinical video | Captured and packaged into DICOM; H.264 and hardware-dependent H.265 are described for iOS. | Video SOP Class, exact transfer syntax/profile, frame and audio constraints: TBC. |
| Presentation States | Annotations may be stored as Presentation State objects. | Presentation State SOP Class, supported graphic/text features and references: TBC. |
| Structured Reports | Annotations may be stored as SR objects. | SR SOP Class, templates, value types and relationships: TBC. |

Described still-image encoding families are uncompressed, DICOM RLE, JPEG, JPEG-LS, JPEG 2000, HTJ2K and JPEG XL. Family availability does not establish every transfer syntax, parameter range or encode/decode role. Section 7.2 provides a standard-identifier reference inventory for verification rather than a supported-syntax declaration.

#### 1.1.1 Structured Reporting root template IDs

TBC. No SR root Template Identifier, Mapping Resource, template version or measurement template is established by the available product descriptions. Do not infer TID 1500 or another template merely from the presence of annotations. Annex A.B records the required content evidence.

### 1.2 DIMSE services

Table 1-2 describes the known scope without asserting unverified protocol roles. The final statement must use the official SCU/SCP Y/N conventions for confirmed supported rows.

| Subsection and service | Described scope | Technical status |
| --- | --- | --- |
| 1.2.1 Verification | Connection verification not explicitly established. | C-ECHO SCU/SCP: TBC. |
| 1.2.2 Storage | Sending acquired/imported DICOM objects to an archive; optional Storage Commitment gate. | Storage SOP Classes, C-STORE roles and commitment model: TBC. |
| 1.2.3 Workflow management | MWL; optional MPPS; UPS status handling. | Exact SOP Classes, SCU/SCP roles and transactions: TBC. |
| 1.2.4 Query/Retrieve | DICOMweb query/retrieve is described. | DIMSE Patient/Study Root C-FIND, C-MOVE and C-GET must not be inferred; TBC. |
| 1.2.5 Printing | No printing capability is described. | Applicability TBC; no support claimed. |

### 1.3 DICOM Web Services

The application is described as connecting to remote DICOMweb services. User Agent roles are the expected workflow model, but the actual supported operations and any Origin Server role require confirmation. The broad phrase "full DICOMweb" is not used as a declaration of every optional service or transaction.

| Subsection and service | Product-level scope | Required declaration |
| --- | --- | --- |
| 1.3.1 URI service | WADO-URI is not specifically described. | TBC; do not infer from WADO-RS. |
| 1.3.2 Studies service | QIDO-RS, WADO-RS and STOW-RS are described. | User Agent/Origin Server role and supported resources, headers, media types and parameters: TBC. |
| 1.3.3 Worklist service | UPS-RS status handling is described. | Supported create/search/retrieve/update/state/cancel/subscription transactions: TBC. |
| 1.3.4 Non-patient instance service | Not specifically described. | TBC; no support claimed. |
| 1.3.5 Storage Commitment web service | Commitment gating is described without an established transport. | HTTP commitment transactions cannot be inferred from DIMSE commitment; TBC. |
| 1.3.6 Modality Scheduled Procedure Step web service | Not separately described. | TBC; do not equate this with DIMSE MWL or UPS-RS. |
| 1.3.7 Modality Performed Procedure Step web service | Optional MPPS is described without evidence of this web service. | TBC; no web MPPS support claimed. |

### 1.4 Media services

Photo Album import/export is described. DICOM file-set creation, reading/updating, DICOMDIR and media application profiles are not established. Photo Album access is not a declaration of DICOM media interchange support. Applicability: TBC.

### 1.5 Real-Time Video service

Recorded video capture is described. DICOM-RTV streaming is a different service and is not established. Applicability: TBC; no DICOM-RTV support claimed.

### 1.6 De-identification profiles

No PS3.15 Attribute Confidentiality Profile or de-identification option is established. Keeping captures inside the app does not establish de-identification support. Applicability: TBC.

### 1.7 Specific Character Sets

Supported DICOM character sets, defaults, query encoding and preservation/conversion behaviour are TBC. Do not infer Unicode/UTF-8 support solely from the mobile operating system or programming language.

## 2 Table of contents

- 1 Overview
- 2 Table of contents
- 3 Introduction
- 4 Implementation model
- 5 Service and interoperability description
- 6 Configuration
- 7 Network and media communication details
- 8 Security
- Annex A.A Information Object Definitions
- Annex A.B Structured Report content encoding
- Annex A.C Security details
- Annex A.D Mapping of attributes
- Annex A.E Code set usage

The PDF provides bookmarks for these sections; the website edition should expose equivalent section navigation.

## 3 Introduction

### 3.1 Revision history

| Revision | Date | Description |
| --- | --- | --- |
| Draft 0.1 | 24 September 2026 | Initial populated draft from owner-described capabilities; release and protocol evidence outstanding. |

### 3.2 Audience

Intended for hospital imaging IT, PACS administrators, integration engineers, procurement teams and engineers responsible for the DICOM Camera implementation. Readers need familiarity with DICOM services and the corresponding conformance statement of the proposed communication partner.

### 3.3 Remarks

This document supports integration assessment. It does not replace testing of the specific applications, versions, configuration and network environment. Acceptance of a DICOM object by an archive does not establish that every viewer can render all of its content, annotations or compression formats.

This draft does not claim regulatory certification, universal interoperability or compliance with an unverified security profile. The issued statement must identify the implementation it describes and the applicable optional features. Marketing pages and generic codec availability are not substitutes for release-specific declarations.

### 3.4 Terms and definitions

Application Entity (AE): the DICOM communication entity. SOP Class: a defined combination of an information object and service. Transfer Syntax: the encoding used to communicate a DICOM data set. SCU/SCP: service user/provider roles. User Agent/Origin Server: client/server roles in DICOMweb. Storage Commitment: the archive's commitment for specified objects, distinct from a successful transfer response.

### 3.5 Abbreviations

AE - Application Entity; DIMSE - DICOM Message Service Element; IOD - Information Object Definition; MWL - Modality Worklist; MPPS - Modality Performed Procedure Step; PACS - Picture Archiving and Communication System; SOP - Service-Object Pair; SR - Structured Report; UID - Unique Identifier; UPS - Unified Procedure Step; TBC - to be confirmed from implementation evidence.

### 3.6 References

Structural reference: [DICOM PS3.2 Annex N, current template](https://dicom.nema.org/medical/dicom/current/output/chtml/part02/chapter_N.html), reviewed as 2026d.

Encoding and identifiers: [DICOM PS3.5](https://dicom.nema.org/medical/dicom/current/output/chtml/part05/PS3.5.html) and [PS3.6 UID registry](https://dicom.nema.org/medical/dicom/current/output/chtml/part06/chapter_A.html).

Applicable technical definitions must also be checked against PS3.3 (IODs), PS3.4 (service classes), PS3.7/PS3.8 (messages/network), PS3.10/PS3.11 (media, if applicable), PS3.15 (security), PS3.16 (content mapping) and PS3.18 (web services) for the edition used to issue the statement. Only edition 2026d was used as the structural/identifier reference for this draft; no claim is made that the app implements every feature of that edition.

Product facts: the product owner's descriptions supplied in September 2026. Evidence from builds, conformance tests, emitted objects and protocol traces remains outstanding.

## 4 Implementation model

### 4.1 Application Entities and data flow

The following is a logical workflow model, not a declaration that the implementation exposes a particular number of AEs, listeners or processes.

1. Patient context is obtained from manual entry, a selected MWL item, or configured HL7/FHIR demographic queries. Quick Take allows capture before the association is completed.
2. Photographs/video are captured in the app, or existing images are imported from Photo Album.
3. Patient/study association and the selected media are reviewed; annotations may be produced.
4. DICOM objects are sent to the selected archive through the configured connection.
5. Local deletion follows the configured retention condition. With commitment gating enabled, deletion waits for successful commitment for the relevant objects.

Logical information flows:

- Patient/workflow services ↔ DICOM Camera: worklist, demographics and procedure status.
- DICOM Camera → PACS/archive: DICOM instances.
- PACS/archive → DICOM Camera: transfer results and, where configured, commitment results.
- Enterprise Manager → DICOM Camera: described entitlement and configuration control; protocol and refresh mechanics TBC.
- Photo Album → DICOM Camera: import; DICOM Camera → Photo Album: explicit export when permitted.

No patient-media relay through Enterprise Manager is established. It must not be represented as a DICOM archive or gateway by default.

#### 4.1.1 Functional definition of DICOM Camera communication entity

The app performs mobile capture and the described clinical-system interactions. The actual AE decomposition, AE titles, communication initiator/acceptor roles, concurrency, background execution and transaction sequencing must be established from the implementation. Separate iOS and Android declarations are needed if they differ.

## 5 Service and interoperability description

### 5.1 Mapping of services to Application Entities

| Logical capability | Known application function | Mapping still required |
| --- | --- | --- |
| Worklist/demographics | Select work or retrieve patient information. | AE or web client, remote endpoint, protocol/version and supported keys. |
| Acquisition and object creation | Capture/import, associate and annotate media. | Created SOP Classes, attribute sources and encoding paths. |
| Storage and commitment | Send objects and optionally gate deletion on commitment. | AE/client roles, object-level responses and callback/polling mechanism. |
| Workflow status | Optional MPPS and UPS/UPS-RS. | Exact operations, state transitions and their relation to capture/send. |

### 5.2 DIMSE services

#### 5.2.1 Basic Worklist Management service

MWL-based capture is described. The expected clinical workflow is querying a worklist provider and selecting an item before capture. The confirmed SCU/SCP declaration, matching/return keys, supported matching types, query cancellation, result limits, scheduled-step selection and patient/study mapping remain TBC. Annex A.D captures the mapping work.

#### 5.2.2 Modality Performed Procedure Step service

MPPS is optional. Document the actual trigger and content of N-CREATE/N-SET operations, supported statuses, discontinuation reasons and handling of capture cancellation, failed storage and interrupted operation. Do not equate a successful upload with a successfully completed performed step without implementation evidence. Roles and protocol details: TBC.

#### 5.2.3 Unified Worklist and Procedure Step service

UPS status handling is described. Support for Push, Pull, Watch, Event or Query SOP Classes cannot be determined from that phrase alone. List the implemented roles, creation/search/retrieval/update/state/cancel operations, transaction UID handling, subscription behaviour and supported state transitions. Each is TBC pending verification.

#### 5.2.4 Instance Availability Notification service

Applicability TBC. No support is established. A Storage Commitment result is not an Instance Availability Notification.

#### 5.2.5 Storage service

Sending DICOM objects to an archive is described. The storage client roles, accepted/proposed presentation contexts, object order, duplicate handling, negotiation behaviour, transfer syntax selection, response interpretation and retries remain TBC. Any receiving Storage SCP role must be declared separately rather than inferred from DICOMweb retrieval.

For iOS video, the owner describes preservation of the encoded capture stream during DICOM packaging. The chosen SOP Class and transfer syntax must match that stream; profile/level, colour format, audio and fragmentation constraints remain TBC.

##### 5.2.5.1 SCU of the Storage SOP Classes

The described upload workflow is consistent with a storage-client function. Confirm the supported classes, roles and service behaviour for the named app release before making a supported-SCU declaration.

##### 5.2.5.1.1 Transcoding of transfer syntaxes

Lossy/lossless encoding choices are described, but no automatic fallback strategy is established. Document whether unsupported negotiation results in failure, lossless transcoding or another explicitly selected path. Do not promise silent conversion to a lossy format. Describe UID, derivation and lossy-history treatment when an object is changed. Import of an already lossy image does not make its history lossless.

##### 5.2.5.2 SCP of the Storage SOP Classes

Applicability TBC. Retrieval through WADO-RS or acceptance of a commitment-result association does not establish a C-STORE SCP implementation.

#### 5.2.6 Storage Commitment service

The described retention option waits for successful DICOM Storage Commitment before deleting the relevant local objects. Successful transmission alone is insufficient when this gate is enabled. Pending or failed commitment retains the affected objects. Confirm handling per SOP Instance, partial success, duplicate results and unmatched transaction identifiers; do not describe a partial response as a whole-study success.

The actual service model and transport are TBC. If the DIMSE Push Model is implemented, document request and N-EVENT-REPORT handling, including whether a result is accepted on the same or a new association and what happens while the mobile app is suspended. An app that accepts a commitment-result association does not thereby implement a general archive Storage SCP.

#### 5.2.7 Query/Retrieve service class

DIMSE query/retrieve roles, information models and C-FIND/C-MOVE/C-GET support are TBC. They must not be inferred from the confirmed product description of QIDO-RS or WADO-RS.

#### 5.2.8 Print Management service

Applicability TBC; no printing support is established.

### 5.3 DICOM Web Services

#### 5.3.1 URI web service

WADO-URI applicability TBC; no support inferred from WADO-RS.

#### 5.3.2 Studies web service

QIDO-RS, WADO-RS and STOW-RS are described. The following table is a completion record, not a declaration of every standard resource.

| Area | Required implementation detail |
| --- | --- |
| 5.3.2.1 Media types | Request/response media types, multipart support, DICOM JSON/XML, transfer-syntax parameters and content negotiation: TBC. |
| 5.3.2.2 Retrieve | Supported study/series/instance/frame/metadata/bulk-data/rendered resources and parameters, if any: TBC. |
| 5.3.2.3 Store | Supported request encodings, batching, partial success/failure parsing, duplicate behaviour and retry rules: TBC. |
| 5.3.2.4 Search | Resource levels, matching keys, include fields, pagination, fuzzy matching and limit/offset behaviour: TBC. |

Document User Agent and any Origin Server roles independently. Retrieve capability does not itself establish a diagnostic viewer or all rendered-media operations.

#### 5.3.3 Worklist web service

UPS-RS status handling is described. Confirm, transaction by transaction, create, retrieve, update, change state, request cancellation, search, subscribe, unsubscribe and suspend-global-subscription behaviour. Record resources, accepted media types, query/header fields, transaction UID management, error responses and any notification channel. Unknown operations are TBC, not implied by the family name.

#### 5.3.4 Non-patient instance web service

Applicability TBC; no separate claim established.

#### 5.3.5 Notification web service

Applicability, subscription mechanism and notification transport TBC. Do not infer these from generic UPS status handling.

#### 5.3.6 Storage Commitment web service

Commit and result-check transactions are TBC. The described Storage Commitment retention gate does not establish an HTTP implementation of these operations.

#### 5.3.7 Modality Scheduled Procedure Step web service

Applicability TBC; no separate claim established.

#### 5.3.8 Modality Performed Procedure Step web service

Applicability TBC; optional MPPS does not establish support for these HTTP transactions.

### 5.4 Media services

File Set Creator, Reader and Updater roles, supported media application profiles and DICOMDIR handling are TBC. Photo Album import/export alone does not populate these declarations.

### 5.5 Real-Time Video services

Service Consumer/Provider roles are TBC. Recorded H.264/H.265 DICOM objects do not establish DICOM-RTV streaming.

### 5.6 Cross-service considerations

Patient/study association is completed before sending in the described Quick Take workflow. The relationships among MWL identifiers, object UIDs, MPPS, UPS and commitment must be documented for patient-first, capture-first and imported-image paths. Attribute precedence, reconciliation after edits, retry state and interrupted-session recovery remain TBC.

Retention is described as automatic deletion after successful send by default, optionally gated on successful commitment. With the gate active, the relevant objects remain retained while commitment is pending or failed. Exact response classification, persistence and recovery behaviour require verification; no server timing or deletion-time guarantee is made.

### 5.7 Specific Character Sets

Encoding/decoding sets, default repertoire, handling of unsupported characters, Person Name representations, round-trip behaviour and query matching are TBC. Populate this separately for DIMSE and DICOMweb where behaviour differs.

## 6 Configuration

### 6.1 General configuration parameters

DICOM Camera Enterprise Manager is described as an optional central service for feature entitlements, floating licences, revocation and user-specific configuration. A user opens an assigned URL or scans an assigned QR code to apply supported settings. Administrators can lock supported settings against user changes. The management protocol itself is outside the DICOM service declarations.

| Parameter or policy | Owner-described control | Default/range and implementation detail |
| --- | --- | --- |
| AE Title | Can be configured through managed enrolment. | Whether calling/called title, uniqueness rules, validation and defaults: TBC. |
| Archive server address | Can be configured through managed enrolment. | Host/IP formats, port, endpoint mappings and validation: TBC. |
| Compression choice | Can be set and locked. | Per-SOP/connection choices, modes, parameters and negotiation policy: TBC. |
| Photo Album export | Can be restricted. | Export paths covered, import distinction and operating-system limits: TBC. |
| Automatic deletion | Configurable and lockable; described default is enabled after successful send. | Scope, response classification, timing and interrupted-operation recovery: TBC. |
| Storage Commitment gate | Optional condition for automatic deletion. | Default gate setting, transport, per-instance result handling and retries: TBC. |
| Advanced-feature entitlements | Centrally enabled for enterprise use. | Release/platform and feature-to-entitlement mapping: TBC. |
| Floating licences/revocation | Shared-pool licensing and central revocation described. | Allocation unit, lease duration, offline/grace behaviour and effective revocation timing: TBC. |

The final configuration tables must identify each parameter's default, permitted values/range, configurability, scope and restart/reconnect requirements. Policy updates, conflicts, user overrides, enrolment reuse/expiry and local changes while offline are not established by the present descriptions.

### 6.2 Configuration of DIMSE services

| Preserved subsection | Required configuration declaration |
| --- | --- |
| 6.2.1 Worklist | Remote AE/host/port, filters, scheduled station/modality handling and time/date scope: TBC. |
| 6.2.2 MPPS | Enablement, destination, status/discontinuation configuration and defaults: TBC. |
| 6.2.3 UPS | Supported service destinations, roles and configurable status/subscription behaviour: TBC. |
| 6.2.4 Availability notification | Applicability TBC. |
| 6.2.5 Storage | Destination definitions, presentation contexts, compression and retry configuration: TBC. |
| 6.2.6 Commitment | Destination/model, callback/listener configuration, retention gate and retry settings: TBC. |
| 6.2.7 Query/Retrieve | Applicability and query/retrieve configuration: TBC. |
| 6.2.8 Print | Applicability TBC. |

### 6.3 Configuration of DICOM Web Services

Preserve subsection positions for 6.3.1 URI, 6.3.2 Studies (retrieve/store/search), 6.3.3 Worklist, 6.3.4 Non-patient Instances, 6.3.5 Storage Commitment, 6.3.6 Scheduled Procedure Step and 6.3.7 Performed Procedure Step. For each applicable service, record base URL/resource configuration, authentication, certificate handling, media types, timeout/retry behaviour and scope of managed settings. All release-specific values are TBC.

### 6.4 Configuration of media storage service

Applicability and settings TBC; no DICOM media profile is established.

### 6.5 Configuration of Real-Time Video service

Applicability and settings TBC; recorded video is not sufficient evidence.

### 6.6 Configuration of audit trail - Syslog

Applicability and settings TBC. No DICOM audit message transmission profile or audit server is established.

## 7 Network and media communication details

### 7.1 General

#### 7.1.1 General association parameters

Table 7-1 records required release-specific identifiers and limits; none may be supplied from a generic example configuration.

| Field | Declaration |
| --- | --- |
| Implementation Class UID | TBC from emitted association/file metadata. |
| Implementation Version Name | TBC by product build. |
| Application Context Name | TBC from association negotiation; verify against the DICOM application context. |
| Calling/called AE titles and validation | TBC; user/managed configuration behaviour described only at product level. |
| Maximum PDU size | TBC, including configurable range/default if applicable. |
| Maximum initiated/accepted associations | TBC. |
| Asynchronous operations window and negotiation | TBC. |
| Connection, association, DIMSE and idle timeouts | TBC with units/default/range. |
| Retry/backoff and cancellation | TBC by service. |
| IPv4/IPv6, DNS and listen ports | TBC. |

### 7.2 Specifications

#### 7.2.1 DICOM Camera Application Entity

Actual AE name(s) and decomposition: TBC. Replicate this section if the implementation has multiple AEs with different behaviour.

**7.2.1.1 Sequencing of real-world activities:** confirm patient selection/capture, object creation, storage, optional MPPS/UPS transitions and optional commitment sequencing, including cancellation and app suspension.

**7.2.1.2 Association parameters:** populate per-AE overrides, supported negotiation items and roles; TBC.

**7.2.1.3 Association initiation:** provide a presentation-context table for every initiated activity, with abstract syntax/SOP Class UID, transfer syntaxes, roles and extended negotiation. Proposed contexts and their ordering are TBC.

**7.2.1.4 Association acceptance:** identify every accepted activity, rejection conditions and callback mechanism. If commitment reports use a new association, document that listener and mobile lifecycle limits. Do not infer a general Storage SCP. TBC.

Table 7-2 is an **identifier reference for engineering verification only**, not a supported transfer-syntax table. UIDs identify standard encodings; application support and per-SOP applicability remain TBC. The candidate inventory is not exhaustive for JPEG variants or video profiles.

| Standard encoding | Transfer Syntax UID | Verification note |
| --- | --- | --- |
| Implicit VR Little Endian | 1.2.840.10008.1.2 | Default syntax behaviour and per-SOP applicability TBC. |
| Explicit VR Little Endian | 1.2.840.10008.1.2.1 | Native encoding path TBC. |
| RLE lossless | 1.2.840.10008.1.2.5 | Encode/decode and pixel constraints TBC. |
| JPEG Baseline, Process 1 | 1.2.840.10008.1.2.4.50 | 8-bit lossy process; actual emitted format TBC. |
| JPEG lossless, Process 14 | 1.2.840.10008.1.2.4.57 | Supported predictor/process selection TBC. |
| JPEG lossless, first-order prediction | 1.2.840.10008.1.2.4.70 | Separate syntax from ordinary lossy JPEG. |
| JPEG-LS lossless | 1.2.840.10008.1.2.4.80 | Exact pixel encoding constraints TBC. |
| JPEG-LS near-lossless | 1.2.840.10008.1.2.4.81 | Error bound and supported settings TBC. |
| JPEG 2000 lossless-only | 1.2.840.10008.1.2.4.90 | Reversible encoding path TBC. |
| JPEG 2000 | 1.2.840.10008.1.2.4.91 | May encode lossless or lossy; actual mode matters. |
| HTJ2K lossless-only | 1.2.840.10008.1.2.4.201 | Per-SOP and receiving-system compatibility TBC. |
| HTJ2K lossless RPCL | 1.2.840.10008.1.2.4.202 | Do not infer RPCL option support from HTJ2K family support. |
| HTJ2K | 1.2.840.10008.1.2.4.203 | May encode lossless or lossy; actual mode matters. |
| JPEG XL lossless | 1.2.840.10008.1.2.4.110 | App transfer negotiation and emission TBC. |
| JPEG XL JPEG recompression | 1.2.840.10008.1.2.4.111 | Preserving an existing JPEG does not undo prior lossy history. |
| JPEG XL | 1.2.840.10008.1.2.4.112 | Mode and constraints TBC. |

Video transfer syntax identifiers are deliberately not selected from generic H.264/H.265 names. The implementation must first establish profile/level, bit depth, chroma, fragmentation and supported SOP Class. Extract the emitted Transfer Syntax UID and validate the bitstream against the corresponding PS3.5 definition.

### 7.3 Status codes

#### 7.3.1 General communication and failure behaviour

Connection rejection, timeout, abort, network loss, application suspension and recovery behaviour are TBC for initiation and acceptance. Persistent state after restart and the meaning of a displayed success/failure state must be documented. The described retention gate must not discard objects after failed or unconfirmed operations.

#### 7.3.2 DIMSE services

For each supported operation, record actual received/returned statuses, application meaning, user feedback, retry/cancellation behaviour and effect on retained objects. Include MWL C-FIND pending/final/cancel behaviour, MPPS N-CREATE/N-SET, UPS operations, Storage C-STORE and commitment request/result handling. Query/Retrieve and Print sections remain subject to applicability confirmation. No numeric response-code handling is declared without evidence.

#### 7.3.3 DICOM Web Services

Record HTTP responses and DICOM payload-level success/warning/failure handling for each implemented transaction, including partial STOW results, authentication errors, unsupported media types, rate/size limits, timeouts and interrupted downloads/uploads. A successful HTTP exchange does not prove that every stored instance succeeded or that commitment was granted. Exact supported statuses and behaviour: TBC.

## 8 Security

### 8.1 Introduction

The owner describes in-app storage of captures, explicit Photo Album export, configurable deletion and enterprise policy locking. These controls alone do not establish encryption, DICOM security profiles, regulatory certification, authenticated enrolment or backup isolation. Security implementation details remain unresolved in this draft.

### 8.2 External network requirements

Required services for archive/worklist access, HL7/FHIR, Enterprise Manager, DNS, time and certificate validation are TBC. Identify direction, host/service, protocol and whether required or optional. Do not infer LDAP, DHCP-based DICOM configuration, SSO or a VPN requirement.

### 8.3 TCP port configuration

Default/configurable destination and listening ports are TBC. Include any separate association used for Storage Commitment results and relevant firewall requirements. Do not assume port 104, 11112 or a publicly reachable listener.

### 8.4 DICOM security profiles support

The following profile groups are retained for completion: 8.4.1 Secure Use and User Identity; 8.4.2 Secure Transport Connection; 8.4.3 Media Storage Security; 8.4.4 Attribute Confidentiality; 8.4.5 Digital Signature; 8.4.6 Additional DICOM Security Profiles. Support is TBC in every group. No PS3.15 profile or option is declared supported by this draft.

### 8.5 User Identity Negotiation support

Association initiation (8.5.1) and acceptance (8.5.2): TBC. Website email/contact functions and enterprise user enrolment do not establish DICOM User Identity Negotiation support.

### 8.6 Web services security features

TLS versions/cipher suites, certificate/hostname verification, client certificates, HTTP authentication, token lifecycle, credential storage and redirects are TBC for each web interface. Do not equate an HTTPS marketing website with a verified secure clinical-data transport.

### 8.7 Other security features

**8.7.1 Media storage security:** Photo Album export is explicit and can be restricted by a managed setting. Local encryption, OS data-protection class, backup rules and secure-erasure behaviour are TBC.

**8.7.2 Network security:** endpoint trust, credential management, permitted destinations and transport protection are TBC.

**8.7.3 Other security features:** Enterprise Manager can govern entitlements and lock supported settings. Enrolment URL/QR authentication, token expiry/reuse, confidentiality, policy integrity, administrator access and offline enforcement need implementation evidence. Licence revocation is not declared to erase patient images. Logging and audit capabilities are TBC.

## Annex A.A Information Object Definitions

### A.A.1 Information shared across multiple IODs

This annex is required for the objects created by the app and is not complete. Exact SOP Classes and module usage must be established from representative emitted objects for capture, imported images, video, Presentation States and SR. The table below is an evidence inventory, not an assertion that all listed attributes are emitted or that it is a complete IOD.

| Attribute area | Representative tags | Product context and missing declaration |
| --- | --- | --- |
| Patient identity | Patient's Name (0010,0010); Patient ID (0010,0020); Issuer (0010,0021) | Entry/worklist/query context described; per-IOD source, presence, precedence and empty-value rules TBC. |
| Patient demographics | Birth Date (0010,0030); Sex (0010,0040) | Query/entry mapping and validation TBC. |
| Study identification | Study Instance UID (0020,000D); Accession Number (0008,0050) | Selected/generated identifiers, reuse and reconciliation TBC. |
| Series identification | Series Instance UID (0020,000E); Modality (0008,0060) | Values, grouping and generation rules TBC; do not infer modality code from the app's name. |
| Object identity | SOP Class UID (0008,0016); SOP Instance UID (0008,0018) | Exact classes, uniqueness and change rules TBC. |
| Character encoding | Specific Character Set (0008,0005) | Supported values and round-trip behaviour TBC. |
| Pixel description | Rows/Columns (0028,0010)/(0028,0011); Photometric Interpretation (0028,0004) | Capture/import/video dimensions, colour representation and transformations TBC. |
| Sample representation | Samples per Pixel (0028,0002); Bits Allocated/Stored (0028,0100)/(0028,0101); Pixel Representation (0028,0103) | Limits per IOD/transfer syntax, planar configuration and signedness TBC. |
| Lossy history | Lossy Image Compression (0028,2110); Ratio (0028,2112); Method (0028,2114) | Initial and historical lossy processing, imported image provenance and updates TBC. |
| Acquisition and equipment | Dates/times, orientation, device/software identity and acquisition metadata | Exact tags, clocks, timezone, EXIF mapping and private attributes TBC. |
| References and annotations | Referenced instances/frames, graphic coordinates and report content | Exact modules, relationships, values and reference integrity TBC. |

Complete separate source, attribute-presence, value-presence, permitted values, conditions and comments fields according to Annex N. Do not label all attributes mandatory merely because they appear in this inventory. **A.A.1.1 Common Modules**, **A.A.1.2 Common Functional Group Macros**, **A.A.1.3 Common Private Modules**, and **A.A.1.4 Coded Values** remain subject to implementation completion.

### A.A.2 Clinical photograph IODs

Exact IOD(s), module tables, capture/import differences, colour profiles, derivation, orientation and compression constraints: TBC. VL Photographic Image Storage is a standard class relevant for investigation, not a confirmed selection. Do not substitute Secondary Capture merely because a photograph originated outside a scanner.

### A.A.3 Clinical video IODs

Exact IOD(s), module tables, frame count/timing, frame references, audio, aspect ratio, bitstream packaging and size constraints: TBC. Confirm that the actual codec stream meets the chosen DICOM video syntax.

### A.A.4 Presentation State IODs

Exact class, referenced images/frames, displayed areas, graphic/text annotations, colour presentation, units and supported operations: TBC. Do not assume annotations are burned into pixel data or that every viewer renders them identically.

### A.A.5 Structured Report IODs

Exact SR class and module population: TBC; see Annex A.B for content encoding. Do not infer a comprehensive or measurement SR class from a general annotation feature.

### A.A.6 Basic Directory and private IODs

Applicability TBC. If emitted, give complete definitions and private-attribute documentation; otherwise mark the applicable sections N/A after verification. Do not invent private UID roots or state that private attributes are absent without examining generated objects.

## Annex A.B Structured Report content encoding

Annotations as Structured Reports are owner-described. No detailed SR template/content declaration is available.

| Content area | Required release-specific declaration |
| --- | --- |
| Root and templates | SOP Class, root concept, root TID if used, mapping resource and extensibility. |
| Nodes and relationships | Supported value types and relationship types, including by-reference usage. |
| Geometry and references | Image/frame references, coordinate systems, units, graphic types and spatial/temporal constraints. |
| Clinical concepts | Concept-name codes, value codes, context groups and coding scheme versions. |
| Measurements | Whether any are produced; numeric representation, units, calibration and measurement conditions if applicable. |
| Document state | Completion/verification flags, observers, identifiers and update/version handling. |

All entries are TBC. No measurement accuracy or clinical measurement functionality is established by the statement that annotations can be stored as SR.

## Annex A.C Security details

### A.C.1 External network requirement details

Time synchronisation (A.C.1.1), network address management (A.C.1.2), application configuration management (A.C.1.3) and DNS service discovery (A.C.1.4) require applicability confirmation. Enterprise Manager is a described proprietary management integration; it does not automatically implement a DICOM configuration-management security profile.

### A.C.2 DICOM security profile details

Preserve the applicable sections for online electronic storage, audit messages, Syslog TLS/UDP transmission, secure transport, confidentiality, digital signatures and additional profiles. Populate only profiles supported by evidence. Versions, algorithms, credentials, event content and failure behaviour are TBC; an absent declaration is not evidence of either support or absence.

## Annex A.D Mapping of attributes

This annex must document actual mapping from MWL to generated objects and MPPS, and any additional patient information source used. The following are mapping questions, not confirmed transformation rules.

| Source or workflow | Required mapping and precedence evidence |
| --- | --- |
| MWL patient and request fields | Patient ID/issuer/name, demographics, accession, requested procedure and scheduled step identifiers into the appropriate object/MPPS paths. |
| HL7/FHIR query | Protocol/version, identifiers and assigning authorities, demographics, code/date handling and mapping to DICOM attributes. |
| Manual entry | Validation, empty-value handling and precedence against selected worklist/query values. |
| Quick Take | Association before send, identifier generation/reuse and changes after capture. |
| Imported images | Acquisition date versus import date, EXIF orientation/colour, prior compression and provenance handling. |
| MPPS/UPS | Relationship of work-item identifiers and resulting study/series/instance references to status updates. |

Every mapping must specify source field/tag, destination tag and full sequence path, condition, transformation, precedence and conflict behaviour. A correct match on patient name alone is not declared. HL7/FHIR interface specifications, when supplied, should be referenced separately from this DICOM statement.

## Annex A.E Code set usage

Supported coding schemes, scheme versions, context groups, local codes, anatomy/laterality values, procedure codes, discontinuation reasons and annotation concepts are TBC. The visible body-part selector does not establish that its values are encoded using a particular DICOM context group or terminology. Publish the actual code/value inventory used by each applicable service and object.

**End of Draft 0.1.** Product release scope, engineering evidence, complete applicable Annex N tables and approval are required before issue as a final conformance statement.
