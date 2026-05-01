# Regulatory Compliance Research for Indian Auto Dealerships (2-Wheeler & 4-Wheeler)
## A Design-Brief for ComplianceCheck.co.in's Pay-Per-Use Compliance Assessment

**Scope:** Full-stack dealerships (showroom + workshop + spare parts + accessories), SMEs employing 10–500 staff, operating across India.
**Target Output:** Inputs for a 6-phase, 50–100-question assessment with applicability filtering.
**Research Date:** May 2026 (post-implementation of Labour Codes, DPDP Rules, ELV Rules, GST 2.0).
**Document Version:** 1.1 (corrections to GST rates, MISP regime, DPDP date).

---

## 1. EXECUTIVE SUMMARY — TOP 10 CRITICAL COMPLIANCE AREAS FOR AN AUTO DEALERSHIP SME

A typical full-service auto dealership in India straddles three regulatory worlds simultaneously: (a) **labour & social-security law** (showroom is a "shop / commercial establishment"; workshop frequently triggers the *Factories Act / OSH Code* threshold); (b) **transport law** centered on the Motor Vehicles Act 1988 and CMVR 1989 (Trade Certificate, registration, HSRP, Bharat NCAP, MISP); and (c) **environment, health & safety law** (SPCB Consents, Hazardous Waste, Battery Waste, ELV, PESO, Fire NOC). On top of these sit horizontal compliances (GST, TDS/TCS, DPDP, POSH, Consumer Protection) and commercial/contractual layers (OEM Dealer Agreement, IRDAI MISP, RBI DSA norms).

The ten most material compliance areas — those most likely to trigger penalties, business interruption or licence cancellation — are:

| # | Compliance Area | Why Critical for a Dealership |
|---|---|---|
| 1 | **Trade Certificate under CMVR Rule 33-43A** (Form 16/16A/17/19A on VAHAN) | Without this no unregistered car/bike can be moved, demoed, test-driven, or transferred between yard, PDI, RTO and customer. Renewable, co-terminus with OEM authorisation. |
| 2 | **Four Labour Codes (eff. 21 Nov 2025)** + residual EPF/ESI/Gratuity/Bonus | Workshop = "factory"/"establishment" with hazardous-process implications; showroom = "shop". Mandatory appointment letters, free annual health check-up for 40+ workers, gig/platform definitions affect washers/drivers. |
| 3 | **Factories Act 1948 / Chapter on Safety in OSH Code** (workshop applicability) | Triggered if 10 workers + power, or 20 workers without power, are engaged in "manufacturing process" (vehicle servicing/repair is held to qualify). Drives Form 4 licence, Form 11 register, lift/hoist certification (Form 8/9). |
| 4 | **SPCB Consent to Establish & Operate (Air + Water Acts)** — Workshop classified **Orange** (PI 41-59) per CPCB — and **Hazardous & Other Wastes Rules 2016** authorisation | Used engine oil, coolants, paint sludge, solvents, oil-water separator effluent, paint-booth & generator emissions all need authorisation; Forms 3, 4, 10 returns. |
| 5 | **Battery Waste Management Rules 2022** (+ Amdt 2023, 2025) and **End-of-Life Vehicles Rules 2025 (eff. 1 Apr 2025)** | EPR sits with the OEM, but dealer is the visible collection node, must register on CPCB EPR portals, channel waste batteries and ELVs only to registered recyclers/RVSFs, maintain trail. |
| 6 | **GST 2.0 (eff. 22 Sep 2025) + TCS u/s 206C(1F) (1% on retail vehicle sale > ₹10 lakh)** | New two-slab structure: 18% small cars / 40% all others (cess fully subsumed); FADA litigation ongoing on transitional cess-credit treatment; e-way bills mandatory; ITC on demo cars remains contested. |
| 7 | **IRDAI MISP Guidelines 2017 (post-2024 EoM regime)** + RBI Master Direction on outsourcing for finance DSA | Specific 22.5%/19.5% commission caps **withdrawn** in 2023-24; insurer EoM-Reg-2024 governs (30% general / 35% health at company level). Single-sponsor, POS exam, no-panel, customer-only solicitation, 7-yr records retained. |
| 8 | **Fire NOC + PESO licence (Petroleum Rules 2002, SMPV Rules 2016, Gas Cylinder Rules 2016)** | Diesel >5,000 L, paint-booth thinners, oxygen/acetylene, CNG, EV-charging area thresholds need PESO; State Fire Service NOC mandatory above area/height thresholds. |
| 9 | **Shops & Establishments Act (state-specific)** for showroom + **Contract Labour (R&A) Act 1970** for washers, security, housekeeping, drivers | S&E registration governs hours, leave, women-employee provisions, opening/closing; CLRA RC for principal employer + licence for contractors with ≥20 (now 50 under OSH Code). |
| 10 | **DPDP Act 2023 + DPDP Rules 2025** (notified 14 Nov 2025; substantive obligations effective 13 May 2027) | Customer KYC, finance docs, test-drive data, service history, telematics — dealership is a **Data Fiduciary**; consent notices, ≤72-hr breach reporting, retention/erasure interplay. |

---

## 2. COMPLIANCE AREA CATALOG

### A. GENERIC STATUTORY (with dealership lens)

**A.1 Four Labour Codes (notified 21 Nov 2025; central rules in draft 30 Dec 2025; final central + state rules expected ~April 2026)**
- *Code on Wages 2019:* National floor wage; uniform "wages" definition (50% cap on excludable allowances) → impacts EPF/gratuity/bonus base for sales executives, technicians, washers; equal remuneration codified.
- *Code on Social Security 2020:* EPF, ESI, gratuity, maternity, employees' compensation consolidated. **Gratuity now after 1 year for fixed-term employees.** Gig/platform worker definitions can be triggered when the dealership tie-ups with aggregator-style delivery riders for spare-parts logistics.
- *OSH&WC Code 2020:* Mandatory **appointment letters for all workers**, **free annual health check-up for workers ≥40 yrs**, working hours 8/day & 48/week, women allowed in night shifts/hazardous processes with consent and safety. Establishments with **even one worker in a hazardous process** must register.
- *Industrial Relations Code 2020:* Standing Orders threshold raised to **300 workers**; retrenchment/lay-off permission threshold raised to **300**; Works Committee at 100; Grievance Redressal Committee at 20.
- *Penalties:* general non-compliance largely decriminalised; imprisonment retained for withholding social-security contributions or hazardous-process safety breaches.
- *Transition note:* Until central + state rules are gazetted, **legacy Acts continue alongside the Codes** ("dual regime"), per BDO/Cyril Shroff/DLA Piper commentary. Corrigendum issued 19 Dec 2025 clarified repeal scope.

**A.2 EPF (residual until full transition)** — applicability ≥20 employees; 12% employee + 12% employer (8.33% to EPS up to ₹15,000 wage ceiling); UAN; ECR by 15th; Form 5A, 11. Dealership coverage almost universal for sales execs, technicians, drivers.

**A.3 ESI** — applicability ≥10 employees; wage ceiling ₹21,000 (₹25,000 for PWDs); 0.75% employee + 3.25% employer; Code extends ESI **PAN-India** automatically. Dispensary mapping a must for technicians, washers, security.

**A.4 Professional Tax (state-specific, max ₹2,500/year)** — applicable in: Maharashtra, Karnataka (exemption raised to ₹25,000/m wef 1 Apr 2025), Tamil Nadu (half-yearly, by Greater Chennai Corp etc.), Telangana, Andhra, WB, Gujarat, Kerala (half-yearly), MP, Assam, Odisha, Tripura, Sikkim, Meghalaya, Bihar, Chhattisgarh, Jharkhand. **No PT** in Delhi, Haryana, UP, Rajasthan, Punjab, Uttarakhand, HP, J&K. Multi-state dealers need PTEC + PTRC in each PT state. *Slabs change frequently with state Budgets — assessment should pull from a maintained reference table.*

**A.5 Payment of Gratuity Act 1972 (now under Social Security Code)** — 5 years continuous service (1 year for fixed-term); 15 days × last drawn wage × completed years; ceiling ₹20 lakh.

**A.6 Payment of Bonus Act 1965** — applies to establishments with ≥20 employees; eligibility wage ceiling ₹21,000; min 8.33% / max 20% on bonus-wage of ₹7,000 or minimum wage (higher).

**A.7 Minimum Wages — state notifications.** Most states have **separate Schedules of Employment** for "Shops & Commercial Establishments" and "Automobile Engineering Workshops/Garages/Service Stations" — dealers must apply the workshop schedule for technicians and the S&E schedule for sales/admin staff. Wages are notified semi-annually with VDA.

**A.8 Shops & Establishments Act (state-specific)** — registration within 30/60 days of commencement; renewals annual to 5-yearly; governs working hours (typically 9/day, 48/week), spread-over, weekly off, leave (EL/CL/SL), women employees, opening/closing hours (often 9 pm/10 pm cap with extended-hours permission), display of holiday list. Key states: **Maharashtra (auto-renewal up to 10 yrs, women allowed till 9.30 pm/9.00 pm with safeguards), Karnataka (e-Karmika portal), Tamil Nadu (LMS portal), Delhi (one-time registration under DSE Act), Telangana (LabourDept portal), Gujarat (S&E Amdt Ordinance 2025), UP, WB, Haryana, Rajasthan, Kerala, Punjab.**

**A.9 Factories Act 1948 (transitions to OSH Code)** — workshop becomes a "factory" if **10 workers + power** or **20 without power** engaged in "manufacturing process". Indian courts and Inspectorates consistently treat **vehicle servicing, denting, painting, body-shop, engine overhaul** as "manufacturing process" under §2(k). Triggers: building plan approval, Form 2 (licence application) → **Form 4 licence**, Form 11 register of adult workers, Form 8/9 (lift/hoist competent-person certificate), creche if ≥30 women, canteen if ≥250, ambulance/welfare officer at higher counts, accident notification (Form 18), annual return Form 22, half-yearly Form 21. **Important:** an admin office on the same premises as the workshop is generally subsumed into the factory; on a separate premises it can be a "shop" under S&E Act.

**A.10 Contract Labour (R&A) Act 1970 → IR Code** — Principal Employer Registration Certificate (RC) at threshold of ≥50 workers (raised from 20 under IR Code); contractor licence at ≥50; Form V, Form VI-B, Form XII, half-yearly Form XXIV. Washers, valets, security, housekeeping, MUVs/test-ride drivers, valet parking, telecallers are typically contract.

**A.11 POSH Act 2013** — mandatory IC at ≥10 employees, external member, annual report to District Officer, awareness training, display of penal consequences. Dealers must cover sales staff (women in dealerships rising), workshop technicians, contract staff.

**A.12 Maternity Benefit Act 1961** — 26 weeks; **crèche mandatory at ≥50 employees**; medical bonus; work-from-home (where nature permits) — relevant for back-office/admin women employees.

**A.13 Equal Remuneration / Equal pay** — embedded in Wage Code §3.

**A.14 Trade Unions / IR** — relevant only at larger multi-outlet dealer groups; Standing Orders only at ≥300 workers under IR Code.

**A.15 DPDP Act 2023 + DPDP Rules 2025**
DPDP Rules **notified 14 November 2025**. Phasing:
- **Phase I (live from notification, 14 Nov 2025)** — Data Protection Board constituted, definitions, exemption provisions.
- **Phase II (12 months, ~Nov 2026)** — Consent Manager registration opens.
- **Phase III (18 months, 13 May 2027)** — substantive obligations: standalone privacy notice (Rule 3); security safeguards (encryption, access control, log retention min. 1 year); breach notification to DPB and affected principals (no harm threshold); children's data verifiable parental consent; 48-hr pre-erasure warning; SDF audits/DPIAs; data-localisation for notified categories.

Dealer-specific data: KYC docs, finance forms, RTO documents, test-drive sign-ups (often Aadhaar-OTP), service history, telematics from connected cars, CRM feeds to OEM.

**Penalty ceilings:** ₹250 cr (failure of reasonable security safeguards), ₹200 cr (breach non-notification or children's-data violations), ₹50 cr (any other violation). Cumulative exposure possible across multiple violations from a single incident.

**A.16 GST — under GST 2.0 (effective 22 September 2025)**
The 56th GST Council (3 Sep 2025) restructured vehicle taxation into a **two-slab regime with cess fully subsumed**:

| Vehicle Category | Pre-GST 2.0 (eff. rate incl. cess) | Post-GST 2.0 (22 Sep 2025) |
|---|---|---|
| Small cars (petrol <1200 cc, diesel <1500 cc, length ≤4 m) | 29-31% | **18%** |
| Mid/large cars, SUVs, sedans, MPVs (>4 m or >1500/1200 cc) | 45-50% | **40% flat (no cess)** |
| 2-wheelers ≤350 cc | 28% | **18%** |
| 2-wheelers >350 cc | 31% | **40%** |
| Buses, trucks, ambulances, three-wheelers | 28% | **18%** |
| Tractors (other than road tractors >1800 cc) | 12% | **5%** |
| Auto parts (uniform, all HSNs) | 18%/28% mix | **18%** uniform |
| EVs (battery-operated) | 5% | **5%** |
| Fuel-cell / hydrogen vehicles | 12% | **5%** |

There is **no 50% slab**. The effective tax burden on large SUVs has actually fallen because the up-to-22% compensation cess has been removed.

Other GST items:
- Registration: state-wise once turnover >₹40 lakh (goods); ₹20 lakh for services.
- **TCS u/s 206C(1F):** 1% on retail sale of motor vehicle (new or used; 2W or 4W) of value > ₹10 lakh — applies *per single transaction* (not aggregate). Threshold/rate also extended from 22 Apr 2025 to ten notified luxury items per CBDT Notification 36/2025 (wristwatches, art/paintings, antiques, coins/stamps, sunglasses, handbags/purses, shoes, sportswear/equipment, home theatre, horses). Not on B2B sale to other dealers. Form 27EQ quarterly + Form 27D to buyer within 15 days of return.
- E-way bills mandatory for inter-state and intra-state vehicle stock movement above state thresholds.
- **Demo car ITC:** mixed AAR jurisprudence; insurers/dealers should support with use-in-furtherance-of-supply documentation; FADA continues to engage CBIC on transitional cess credit treatment post-Sep-2025.
- GSTR-1 (11th), GSTR-3B (20th), GSTR-9/9C (annual). Reverse charge on legal/professional/GTA.
- E-invoicing mandatory for AATO > ₹5 cr.

**A.17 Income Tax / TDS** — TDS under §192 (salaries), §194C (contractors — washing, security, housekeeping), §194H (commissions to insurance/finance referrers), §194I (rent on showroom), §194J (audit, IT consultants), §194Q (purchase of goods >₹50 lakh from a vendor). **Tax audit u/s 44AB** if turnover > ₹1 crore (₹10 crore where ≥95% digital).

**A.18 Companies Act 2013 / LLP Act** — annual filings AOC-4, MGT-7, board meetings (4/yr for Pvt Ltd; relaxed for OPC/small co), DIR-3 KYC (30 Sep), DPT-3, statutory registers (members, directors, charges).

**A.19 Trademark / IP** — use of OEM trademark only per Dealer Agreement; dealer cannot register OEM marks.

**A.20 BOCW Act** — applicable if showroom/workshop construction project employs ≥10 workers; cess 1% of construction cost; registration of beneficiaries.

### B. AUTO-DEALER-SPECIFIC

**B.1 Motor Vehicles Act 1988 + CMVR 1989**
- *Trade Certificate (Rules 33-43A)* — application **Form 16** + manufacturer authorisation **Form 16A** (introduced Sep 2022 vide GSR 703(E), eff. 1 Nov 2022). Trade Certificate **Form 17** (digital from VAHAN), additional registration marks **Form 17A/17B**, change of address **Form 17C**. **Form 18 (duplicate) is now omitted** — replaced by online process. **Form 19A** mandates electronic register of inventory on VAHAN. Validity now **co-terminus with dealership authorisation** (typically 5 years for manufacturers; for dealers it follows OEM appointment). Issuance within 30 days; refusal must be reasoned and after hearing. Display of dealership authorisation in showroom mandatory. **Class-wise application** (motorcycle, LMV, MPV, MGV, HPV, HGV, e-rickshaw, e-cart, adapted vehicle).
- *Delivery process forms* — Form 20 (RC application), **Form 21 (sale certificate)**, **Form 22 (roadworthiness)**, Form 23 (temp registration), Form 29/30 (transfer), Form 33 (address change). Dealer-Point Registration via VAHAN.
- *HSRP* — under Rule 50; mandatory PAN-India for new registrations from 1 Apr 2019; retro-fit for older vehicles being rolled out state-by-state via bookmyhsrp.com (Delhi/UP/HP/Haryana online; offline elsewhere). New-vehicle HSRP cost subsumed in OOR; dealer cannot charge separately. Maharashtra extended retrofit deadline to 30 Jun 2025.
- *BS-VI Phase II* live since 1 April 2023; only BS-VI compliant new vehicles can be sold — manufacturer obligation but dealer cannot stock/sell non-compliant.
- *Bharat NCAP / AIS-197* — voluntary star-rating regime live from **1 Oct 2023**; M1 vehicles ≤3.5 t & ≤8 passengers; tests at 64/50/29 kmph; ESC and front-seat-belt-reminders prerequisites for ≥3 stars; pole impact at ≥3 stars. Major upgrade with ADAS testing announced for Oct 2027. Dealers should disclose star ratings in marketing collateral.
- *CAFE-III norms* (corporate average fuel efficiency) effective FY 2027-28 — manufacturer obligation but dealers cannot circumvent with non-compliant SKUs.
- *Mandatory 6 airbags* — was proposed for Oct 2023, deferred; instead BNCAP regime drives the market. Driver airbag mandatory; front-passenger airbag mandatory for new models from Apr 2021/older from Dec 2021; 3-point seatbelts for all forward-facing seats from Oct 2022.

**B.2 Motor Vehicle Aggregator Guidelines** — mostly NA for pure dealers; relevant only if dealership runs a captive cab/test-ride pool offering on-demand mobility.

**B.3 State Motor Vehicle Rules** — Maharashtra MV Rules 1989, Karnataka MV Rules 1989, Tamil Nadu MV Rules 1989, Delhi MV Rules 1993, Telangana MV Rules etc. — local trade-certificate fees, state-specific delivery forms, dealer-point registration, road tax (one-time/quarterly) collection arrangements with State Transport.

**B.4 EV-specific compliance**
- **PM E-DRIVE scheme** (29 Sep 2024, 2-yr outlay ₹10,900 cr) — successor to FAME-II — supports e-2W (24.79 lakh), e-3W (3.16 lakh), e-buses (14,028), e-trucks, e-ambulances. Dealer must be enrolled on the scheme portal to deliver subsidised vehicles.
- State EV policies — Delhi EV Policy 2.0; Maharashtra EV Policy 2021 (extended to 2025/2026); Karnataka EV & Energy Storage Policy; TN EV Policy 2023; Telangana EV Policy; Gujarat EV Policy; UP EV Policy 2022. Each provides road-tax/registration exemption, sometimes capital subsidy for charging infra.
- EV charging — must comply with MoP Guidelines on EV Charging (rev. 2022/2024); CEA Technical Standards; CCS-2/Bharat-DC-001 standards.

**B.5 Battery Waste Management Rules 2022** (notified 22/24 Aug 2022; amended Oct 2023, **Feb 2025**) — covers Pb-acid, Li-ion EV, portable, industrial. **Producer/importer/brand-owner** carries EPR; **dealer is required to register only if it sells under own brand**. Annual returns by 30 June (extended for FY24-25 to 30 Sep 2025). Environmental Compensation for non-compliance. CPCB EPR portal: eprbattery.cpcb.gov.in.

**B.6 E-Waste Management Rules 2022** — ECUs, infotainment, telematics units, workshop diagnostic equipment, IT assets — generator authorisation; channelisation only via registered recyclers; Form 1A (authorisation), Form 3 (annual return).

**B.7 Hazardous & Other Wastes (M&TM) Rules 2016** — used engine oil (Sched I cat 5.1), oil-water separator sludge, paint sludge, solvent residues, contaminated PPE, used filters, oily rags. **Workshop must obtain HW authorisation from SPCB** (typically piggy-backed on CTO renewal). Storage in covered, labelled, bunded area; manifest **Form 10** for transport; annual return **Form 4** (by 30 June); record **Form 3**; sale only to MoEFCC/CPCB-registered re-refiners/recyclers/TSDFs.

**B.8 Plastic Waste Management Rules 2016 (am 2022, 2024)** — packaging from spares, accessory wrap, oil bottles. Brand-owner EPR primarily, but bulk-generator dealers must segregate.

**B.9 Used Oil** — Schedule II of HW Rules; sold/handed over only to registered re-refiners; trail kept.

**B.10 Water Act 1974 + B.11 Air Act 1981** — **CTE before construction** of workshop; **CTO before commissioning**. Auto-service units → CPCB **Orange category** (PI 41-59), thus CTE/CTO with Environmental Management Plan. Effluent (paint booth, washing) needs ETP/oil-water separator; air emissions (paint booth, gen-set, welding fumes) need scrubber/filters. Water Cess under W&A (Cess) Act 2003 (since merged in environment cess).

**B.12 Environment Protection Act 1986** — umbrella; basis for ELV, HW, BWM, PWM, EWM rules.

**B.13 PUC Centre** — if dealership operates a Pollution-Under-Control (Checking) Centre, separate authorisation from State Transport Dept; software integration with sarathi/parivahan.

**B.14 Petroleum Act 1934 + Petroleum Rules 2002 (PESO)** — diesel/petrol storage:
- *Diesel <5,000 L* — no licence (intimation only).
- *Class A (petrol) >30 L; Class B (diesel) >2,500 L; Class C >45,000 L* → Form XIV/XV (storage)/Form XVI (import) licence.
- Workshop diesel for gen-set, MS for testing, lubricants, paints/thinners (solvents under Inflammable Substances Act).
- Validity 3-5 yrs; renewal ≥30 days before expiry.

**SMPV (Unfired) Rules 2016** — for LPG/CNG cylinders, compressed-gas pressure vessels.

**B.15 Explosives Act / Gas Cylinder Rules 2016** — oxygen, acetylene (welding), CNG/LPG (CNG-vehicle servicing), nitrogen for tyre filling — competent-person certification of cylinders, storage layout, distance norms.

**B.16 Fire NOC** — under State Fire Service Acts (Maharashtra Fire Prevention & Life Safety Measures Act 2006, Tamil Nadu Fire Service Act 1985, Delhi Fire Service Act 2007, Karnataka Fire Force Act 1964 etc.) read with **NBC 2016 Part 4**. Triggered typically: built-up area >500 m² or height >15 m (state-variable); periodic renewal; Form A application, certificate Form B.

**B.17 Building bye-laws / Town planning** — showroom = mercantile occupancy (M); workshop = industrial G-2 (low-hazard) or H (hazardous if paint booth & solvents); parking norms (ECS), signage permission from local body, conversion of land use if not already commercial.

**B.18 BIS / Quality Control Orders** — mandatory ISI marking; selling non-BIS goods is a punishable offence under BIS Act 2016 (up to 2 yrs / ₹2 lakh + product seizure):
- Helmets — IS 4151:2015 (motorcycle); QCO in force.
- Tyres — IS 15633 (2W tubeless), IS 15634 (PV), IS 15636 (commercial).
- Auto batteries — IS 14257 (lead-acid).
- Seat belts — IS 15140; CRS — IS/AIS 072.
- Reflective number-plate (HSRP) plate-substrate — IS 14611.

**B.19 Legal Metrology Act 2009** — packaged commodity rules for engine oils, coolants, washer fluid sold by quantity (declaration of MRP, net quantity, mfg date, batch); display of price-board; **MRP cannot be exceeded**; weighing equipment (if any) needs verification stamp.

**B.20 Consumer Protection Act 2019 + Consumer Protection (E-Commerce) Rules 2020** — display of grievance officer/nodal officer details on website and showroom; CCPA jurisdiction over misleading ads; Right-to-Repair-aligned disclosures; Class actions; Recall/Refund/Replacement provisions; mandatory 30-day grievance turnaround.

**B.21 Real Estate / Lease compliance** — Registration Act 1908 mandatory for leases >12 months; state stamp duty (Maharashtra Stamp Act, etc.); Shops & Establishments registration uses leased-premises documents.

**B.22 IRDAI MISP regime — post-2024 EoM Regulations**
The original MISP Guidelines of 31 Aug 2017 (eff. 1 Nov 2017) capped distribution fees at 22.5% (2W) / 19.5% (PV). **Those caps were withdrawn** by the IRDAI Circular on Payment of Distribution Fees to MISP (2023), which removed Section 15(5)(c) of the MISP Guidelines. The current regime is the **IRDAI (Expenses of Management, including Commission, of Insurers) Regulations 2024**, effective 1 April 2024 (consolidated from the 2023 separate Commission and EoM regulations). Key features for dealers:
- Insurer-level overall **EoM cap of 30% (general insurers) / 35% (health insurers)** of gross written premium.
- Each insurer must have a **Board-approved policy** on commission, rewards and distribution fees; reviewed periodically.
- Specific MISP commission caps no longer prescribed by IRDAI — commercial negotiation between insurer/intermediary and dealer, subject to insurer's Board policy.
- **Other MISP provisions remain in force**: appointment by **one** sponsor (insurer or intermediary, not multiple); **Designated Person** must clear POS exam; **no panel of insurers** restriction; **no solicitation** of insurance for vehicles not sold by the dealership (other than renewal/relocation); **no interference** with surveyor/loss assessor; **records retained 7 years** from policy issuance or MISP termination, whichever is later; UIN linked to PAN on IIB; Code of Conduct.
- *Industry note:* Many insurers continue to pay MISPs at or near the legacy 22.5%/19.5% benchmark by commercial practice; assessment can flag this as a *commercial benchmark* rather than a regulatory cap.
- IRDAI Committee Report 2021 proposed further MISP reform; no new MISP-specific regulation issued as of May 2026 — track IRDAI exposure drafts.

**B.23 Vehicle Finance / DSA** — RBI Master Direction on Outsourcing of Financial Services 2023 and KYC Master Direction 2016 (am. 2024) apply when dealers act as DSA — must follow lender's KYC/AML SOPs, no charging from customer beyond approved processing fee, FPC (Fair Practice Code) compliance.

**B.24 Dealer Agreement with OEM** — purely contractual but commercially binding. FADA has long advocated an "Auto Dealer Protection Act" (proposed 2021); as yet no statute. Termination, repurchase of stock, indemnification, territory rights are commercial-compliance items the assessment can flag.

**B.25 Pricing displays** — On-road price disclosure (FADA SOP); RTO charges separately itemised; insurance premium separately; accessories optional disclosure; CCI assumed anti-profiteering jurisdiction wef 1 Apr 2025.

**B.26 Right to Repair Framework** — MoCA portal (righttorepairindia.gov.in) launched 25 Dec 2022; automobile sector formally onboarded Jul 2024; expectation of repair manuals, spare-parts price/availability, third-party repairer ecosystem, repair videos. Currently voluntary; **no separate dealer registration**, but OEMs upload data and dealers should align after-sales transparency.

**B.27 Vehicle Scrappage Policy / RVSF** — MoRTH RVSF Rules 2021; dealers may operate Authorised Vehicle Scrapping Facility / Registered Owner Collection Centre under separate registration with State Transport. V-VMP (govt vehicles) live; private 15 yr/20 yr fitness regime rolling out; **Certificate of Deposit** entitles tax concessions on new vehicle — dealer must accept and forward to RTO.

**B.28 End-of-Life Vehicles Rules 2025** (S.O. 98(E) dt. 06 Jan 2025; **eff. 1 Apr 2025**) — Producers (OEMs) carry EPR; **bulk consumers (>100 vehicles)** must register (relevant for fleet customers and dealer-owned demo/test-ride fleets); dealer may serve as a **Collection Centre**; CPCB centralised portal; Forms 1-8 (annual/quarterly returns); environmental compensation for non-compliance; targets in steel-recovery weight basis; first producer declarations due 30 Apr 2026 for FY26.

### C. WORKSHOP-SPECIFIC EHS

**C.1 OSH Code / Factories Act provisions** (key items to audit):
- First aid box per 50 workers; ambulance-room ≥500.
- Adequate ventilation, lighting, drinking water, latrines/urinals (separate for women).
- **PPE** — gloves (mechanical/chemical), goggles (grinding), ear-muffs/plugs (compressor area), safety shoes, masks (paint-booth — air-supplied for spray).
- **Machine guarding** — lathes, grinders, drills, presses (for body-shop), tyre-changer.
- **Lifting equipment** — scissor/2-post/4-post lifts: annual competent-person certification (Form 8/9), load testing, marking SWL.
- **Pressure vessels (air compressors)** — annual hydraulic test, safety-valve set-pressure, IBR if steam.
- **Working at height** — for car-wash overhead spray, signage installation; full-body harness, anchor points.
- **Confined space** — fuel-tank repair: hot-work permit, gas testing, attendant.
- **Hot work (welding, cutting)** — permit system; FE positioning.
- **Chemical (paints, thinners, brake-clean)** — MSDS available, secondary containment, eye-wash/safety shower in paint-shop, no-smoking signage.
- **Notice of accident** — Form 18 within 4 hrs to inspector; reportable under §88 if death/24-hr disablement.

**C.2 OEM service standards** — adherence to OEM SOPs (standardised work cards, tooling, calibration), JD Power/CSI tracking; warranty terms.

**C.3 Structural safety** — annual structural fitness for tall service ramps, mezzanines, hoist pits.

**C.4 Electrical safety** — CEA (Measures Relating to Safety & Electric Supply) Regulations 2010 (replaced IE Rules 1956): periodic earthing test (≤1 ohm), insulation test, ELCB/RCCB; Electrical Inspector approval if HT installation >250 kVA or LT >100 A; **energy audit** mandatory under EC Act for designated consumers (most large workshops are not, but state DISCOM rules vary).

**C.5 Lifts & Escalators (state-specific)** — Maharashtra Lifts Act 2017, Karnataka Lifts Act 2012, TN Lifts Act, Delhi Lifts & Escalators Act 2024 — registration of every passenger lift; periodic inspection; mandatory if showroom has lifts.

### D. STATE-SPECIFIC ANNEXURE (top dealership states)

| State | S&E Act | PT | SPCB Workshop Cat. | Fire NOC | EV-Dealer Notable |
|---|---|---|---|---|---|
| **Maharashtra** | Maharashtra Shops & Establishments (RECS) Act 2017 | Yes — slabs notified periodically; verify current | Orange (MPCB) | Maharashtra Fire Prevention Act 2006; Form B by Fire Officer; ULB licence | EV Policy 2021-2025; road-tax exempt; MPCB White-listed 850 industries Feb 2026 |
| **Karnataka** | Karnataka S&CE Act 1961 (e-Karmika portal) | Yes — exempt up to ₹25,000/m wef 1 Apr 2025 | Orange (KSPCB) | Karnataka Fire Force Act 1964; mandatory >15m/500m² | Karnataka EV & Energy Storage Policy 2017-2022 (extn); BESCOM tariff for EV charging |
| **Tamil Nadu** | TN S&E Act 1947 (LMS portal) | Yes — half-yearly; up to ₹2,500/yr | Orange (TNPCB) | TN Fire Service Act 1985 | TN EV Policy 2023; road tax 100% waiver Pax EV |
| **Delhi NCR** | Delhi Shops & Establishments Act 1954 | **No PT** | Orange (DPCC) | Delhi Fire Service Act 2007 | Delhi EV Policy 2.0 (extended); MCD trade licence |
| **Gujarat** | Gujarat S&E (Reg. of Empl. & Conditions of Service) Act 2019; **Amdt Ordinance 2025** | Yes — slab notified periodically | Orange (GPCB) | Gujarat Fire Prevention & Life Safety Act 2013 | Gujarat EV Policy 2021 |
| **Telangana** | Telangana S&E Act 1988 (LabourDept portal) | Yes — current slabs on TS LabourDept portal | Orange (TSPCB) | Telangana Fire Services Act | Telangana EV & ESS Policy 2020-30 |
| **Uttar Pradesh** | UP Dookan Aur Vanijya Adhishthan Adhiniyam 1962 | **No PT** | Orange (UPPCB) | UP Fire Prevention & Fire Safety Act 2005 | UP EV Mfg. & Mobility Policy 2022 |
| **West Bengal** | WB S&E Act 1963 | Yes — current slabs on WB Profession Tax portal | Orange (WBPCB) | WB Fire Service Act 1950 | WB EV Policy 2021 |
| **Haryana** | Punjab S&CE Act 1958 (extends) | **No PT** | Orange (HSPCB) | Haryana Fire Service Act 2009 | Haryana EV Policy 2022 |
| **Rajasthan** | Rajasthan S&CE Act 1958 | **No PT** | Orange (RSPCB) | Rajasthan Fire & Emergency Services Bill | Rajasthan EV Policy 2022 |
| **Kerala** | Kerala S&CE Act 1960 | Yes — half-yearly up to ₹2,500/yr | Orange (KSPCB) | Kerala Fire & Rescue Services Act | Kerala EV Policy 2022 |
| **Punjab** | Punjab S&CE Act 1958 | **No PT** | Orange (PPCB) | Punjab Fire & Emergency Services Bill 2022 | Punjab EV Policy 2022 |

*Note: PT slabs for "Yes" states change frequently with state Budgets — assessment should reference a maintained slab table rather than hard-code.*

---

## 3. PHASE 1 — APPLICABILITY QUESTIONS (Filtering)

These should run before any compliance question. Approximately 25 applicability questions.

**Entity / scale**
1. Legal form (Proprietorship / Partnership / LLP / Pvt Ltd / Public Ltd / OPC)?
2. PAN, GSTIN(s), CIN/LLPIN?
3. Total employee count (on-rolls + contract + apprentices) — slabs: <10 / 10-19 / 20-49 / 50-99 / 100-299 / 300-499 / ≥500.
4. Number of women employees (drives crèche, maternity, IC scrutiny).
5. Annual turnover bracket (drives 44AB, e-invoicing, GSTR-9C).
6. Number of states/UTs of operation?
7. Number of physical outlets?

**Vehicle type & business mix**

8. Vehicles sold — 2W only / 4W only / both / commercial / EV / CNG / used vehicles?
9. OEM(s) you represent?
10. Do you provide test rides / test drives on public roads? (drives Trade Certificate, helmets for 2W).
11. Do you operate a workshop on premises? (drives Factories/OSH, CTO, HW, PESO).
12. Workshop services — General service / body-shop & paint / engine overhaul / EV repair / tyres / glass / electricals?
13. Do you operate a PUC checking centre?
14. Do you sell extended warranty / accessories / fuel additives?
15. Do you operate or own RVSF / scrapping facility / collection centre?

**Premises**

16. Showroom built-up area; workshop built-up area (drives Fire NOC, BOCW).
17. Do you have lifts / vehicle hoists / paint booth / oxy-acetylene / CNG dispenser / EV charger?
18. Diesel/petrol storage — quantity in litres?
19. Owned or leased premises?

**Workforce composition**

20. Do you engage contract labour? Number / nature of work (washing, security, F&B, valet)?
21. Do you employ apprentices under Apprentices Act?
22. Do you have any worker engaged in "hazardous process" (paint-booth spraying, welding, battery handling)?

**Cross-sell**

23. Do you sell motor insurance — and via insurer or broker MISP?
24. Do you facilitate vehicle finance for any bank/NBFC as DSA?
25. Do you collect personal data of customers in digital form (DMS, CRM, telematics)? → DPDP applicability automatic.

This filter creates branches (e.g., a 12-employee single-outlet 2W dealer with no body-shop, no diesel storage, no contract labour, single state — gets ~25-30 questions; a 300-employee multi-outlet 4W dealer with full body-shop, paint, EV charging, multi-state — gets ~95-100 questions).

---

## 4. PHASE 2 — COMPLIANCE QUESTIONS BY AREA (5–15 each)

(Phrased as audit prompts; assessment can convert to Yes/No/NA + evidence upload.)

### 4.1 Trade Certificate / CMVR (10)
1. Do you hold valid Form 17 Trade Certificate for each class of vehicle you sell?
2. Is Form 16A dealership authorisation displayed in showroom and uploaded on VAHAN?
3. When did the last renewal occur and when is the next due (≥30 days before expiry)?
4. Do you maintain Form 19A digital inventory register on VAHAN portal in real time?
5. Are trade-registration plates affixed only to vehicles being moved by you (not third parties)?
6. Have you obtained Form 17B for additional registration marks if more demo cars added?
7. Have you intimated Form 17C upon any change of business address?
8. Do you ensure no test drive happens on public roads without trade plate + valid driving licence + insurance?
9. Are Form 20-23 and Form 21/22 issued for each retail sale, with electronic upload to VAHAN?
10. HSRP — is each vehicle delivered with HSRP affixed at dispatch (no extra charge)?

### 4.2 Labour Codes / EPF / ESI / Gratuity / Bonus / S&E (12)
1. Are appointment letters issued to **all** workers and contract staff (mandatory under Code on Wages)?
2. Are wages paid by 7th of following month via bank transfer?
3. Is wage structure compliant with new "wages" definition (allowances ≤50% of total)?
4. Are EPF contributions deposited by 15th, ECR filed, UANs allotted?
5. Is ESI registration in place; contributions deposited by 15th; dispensary mapping done for technicians?
6. Are technicians/washers covered by ESI even if salary just at threshold?
7. Are PT registrations (PTRC + PTEC) live in every PT-state of operation?
8. Are minimum wages paid as per the workshop schedule (technicians) and S&E schedule (sales/admin) of the relevant state, with VDA?
9. Annual health check-up provided to all workers ≥40 yrs (OSH Code requirement)?
10. Is the S&E registration live for every showroom, with weekly off, holiday list, women-employee provisions complied with (closing-time cap)?
11. Bonus ≥8.33% paid to all eligible employees by 30 Nov?
12. Gratuity payouts within 30 days of cessation; provisioned in books?

### 4.3 Factories Act / OSH (workshop-specific) (12)
1. Is Form 4 factory licence current and displayed?
2. Is Form 11 register of adult workers maintained?
3. Have all lifts/hoists been certified by Competent Person on Form 8/9 in last 12 months?
4. Are pressure vessels (air compressor) hydraulic-tested annually?
5. Are pollution-control equipment (paint-booth scrubber, mist eliminator) inspected and logged?
6. PPE issuance register maintained; PPE compliance enforced in body-shop/paint?
7. MSDS displayed at chemical storage; secondary containment provided?
8. Hot-work permit system documented; LOTO procedure for electricals?
9. First-aid trained personnel ≥1 per 150 workers; first-aid box equipped?
10. Crèche provided if ≥30 women workers (Factories Act) / ≥50 (Maternity Benefit)?
11. Annual return Form 22 filed on or before 31 Jan; half-yearly Form 21 by 15 Jul?
12. Notifiable accidents reported on Form 18 within statutory time?

### 4.4 Contract Labour (R&A) (8)
1. RC issued to principal employer mentioning contractors and headcount?
2. Each contractor with ≥50 workers has valid licence?
3. Forms V, VI-B, XII, XIII, XIV maintained?
4. Half-yearly return Form XXIV / annual return Form XXV submitted?
5. Are contractor's wages, EPF, ESI deposit verified monthly by principal employer?
6. PPE, drinking water, latrines provided to contract workers?
7. Wage parity (same/similar work) — Wage Code compliance?
8. Notice of commencement/termination of contract work given to inspector?

### 4.5 POSH (6)
1. Internal Committee constituted with ≥1 external member; reconstituted every 3 years?
2. Awareness training conducted annually for all employees and contract workers?
3. Annual report submitted to District Officer by 31 Jan?
4. POSH policy displayed in vernacular at every outlet?
5. Complaint register & inquiry-records confidential?
6. Workshop-specific (male-dominant) sensitisation done?

### 4.6 SPCB Consents + HW + EWaste + BWM + ELV (15)
1. CTE obtained before workshop construction/expansion?
2. CTO valid (Air + Water Acts) covering entire installed capacity?
3. HW Authorisation under HOWM 2016 valid?
4. Used oil sold only to MoEFCC/CPCB-listed re-refiners?
5. Form 3 inventory of HW maintained; Form 10 manifest for every transport; Form 4 annual return filed by 30 June?
6. Oil-water separator, paint-sludge dryer, scrubber operational?
7. Hazardous waste storage area bunded, labelled, ventilated, locked?
8. Battery dealer registration on CPCB EPR portal (if selling under own brand)?
9. Waste batteries channelised to registered recyclers; quarterly returns?
10. E-waste from workshop diagnostic tools, ECUs, infotainment — sent to authorised dismantler?
11. Plastic packaging — bulk-generator obligations followed?
12. ELV — registered as Bulk Consumer (>100 vehicles in dealer demo + test-ride fleet)?
13. Are end-of-life dealership demo vehicles routed only to RVSFs?
14. Water cess paid; effluent-quality monitored quarterly via NABL lab?
15. Continuous emission/effluent monitoring (online) where SPCB has mandated?

### 4.7 PESO / Fire (10)
1. Diesel storage <5,000 L (intimation only) or licensed (Form XIV/XV)?
2. PESO licence number; validity; renewal in progress 30 days prior?
3. Storage area distance from boundary, ignition sources per OISD?
4. Fire-water ring main & hydrants, FE — last refill date; smoke detectors and panel functional?
5. Mock fire drill in last 6 months?
6. Fire NOC from State Fire Services current; renewals on schedule?
7. Are oxygen/acetylene cylinders stored separately, chained vertical, in shaded area, with flash-back arrestors?
8. CNG/LPG cylinder storage compliant with SMPV Rules 2016?
9. Are paint-booth and paint-mixing area Ex-rated electricals (PESO/ATEX)?
10. EV-charging station — fire-detection and Type-2/CCS-2 compliance?

### 4.8 GST / Income-Tax / TCS (10)
1. GST registration in every state of supply; e-invoicing where AATO >₹5 cr?
2. **Vehicle invoices > ₹10 lakh (per single transaction)** — TCS u/s 206C(1F) collected at 1% and remitted (TCS deposited by 7th of following month; Form 27EQ Q'ly; Form 27D to buyer within 15 days of return)?
3. From 22 Apr 2025, are notified luxury goods (>₹10 lakh per item) — wristwatches, art, paintings, sunglasses, handbags, shoes, sportswear, home theatre, horses — also TCS-collected?
4. Are GST 2.0 rates (18% small car / 40% mid-large / 5% EV / 18% 2W ≤350cc / 40% 2W >350cc) correctly applied on invoices since 22 Sep 2025?
5. E-way bills generated for all inter-state stock transfers and customer deliveries?
6. ITC on demo cars supported by use in furtherance of supply documentation; transitional cess credit position documented?
7. Reverse-charge GST paid on legal/professional/GTA?
8. GSTR-1, 3B, 9, 9C filed within due dates last 12 months?
9. TDS — 192/194C/194H/194I/194J/194Q deposited and 24Q/26Q filed?
10. Tax audit u/s 44AB filed if turnover crossed thresholds; SFT (Form 61A) reporting of cash receipts ≥ ₹2 lakh from vehicle sale; Form 60/61 for high-value cash receipts (Rule 114B)?

### 4.9 IRDAI MISP (post-2024 EoM regime) (8)
1. MISP appointment letter (Annexure 1 format) from **one and only one** intermediary/insurer (single-sponsor rule)?
2. UIN mapped to PAN on IIB?
3. Designated Person — completed POS exam; valid certificate?
4. Distribution-fee/commission paid in line with sponsor's Board-approved policy under IRDAI EoM Regulations 2024 (no specific MISP cap, but insurer overall EoM ≤30%/35%)?
5. No-panel-of-insurers rule — choice of insurer offered to customer?
6. No solicitation of insurance for vehicles not sold by you (excluding renewal/relocation)?
7. Records of policies issued/serviced retained 7 years from policy issuance/MISP termination (later)?
8. No interference with surveyor/loss assessor; no personal gain in claim?

### 4.10 Vehicle Finance / DSA (6)
1. DSA agreement with each lender; not exceeding RBI outsourcing master direction limits?
2. Customer KYC done per lender SOP; no Aadhaar photocopy retained beyond purpose?
3. Fair Practice Code displayed?
4. No sub-DSA without lender consent?
5. No charging customer beyond approved processing fee?
6. Suspicious transaction reporting trained?

### 4.11 DPDP (10)
1. Privacy notice (in any 8th-Schedule language requested by Data Principal) issued at point of data collection (test-drive form, KYC, finance, service intake)?
2. Consent captured separately from terms (granular, specific purpose-wise)?
3. Data fiduciary inventory — KYC, finance, RTO docs, telematics, CRM — mapped?
4. Vendor (DMS, OEM, telecaller) DPAs in place per Rule 6?
5. Breach notification playbook documented (immediate to affected principals; detailed report to DPB within 72 hours)?
6. Children's data — verifiable parental consent flow (Digital Locker / identity / token)?
7. Right to access / correction / erasure / nomination / grievance operational?
8. DPO appointed (mandatory only for SDFs once notified) — readiness desired by May 2027?
9. Retention schedule aligned with 7-year MISP + Income Tax + Companies Act periods; minimum 1-year traffic/processing log retention?
10. Cross-border data transfer (cloud DMS hosted abroad) — assessed against DPB's negative-list approach?

### 4.12 Consumer Protection / Right to Repair / Legal Metrology (8)
1. Grievance officer appointed and contact displayed at every outlet & website?
2. Customer-charter posted; 30-day SLA?
3. Recall communications (when OEM issues) executed and tracked?
4. MRP displayed on accessories, oils, coolants — no over-charging?
5. Spare-parts price list available to customer on demand (Right to Repair)?
6. Repair manuals / FAQs / videos linked from website (RtR onboarding)?
7. No misleading ad / ASCI compliance for digital/print/social?
8. Bharat NCAP rating disclosed in marketing collateral where rated?

### 4.13 Companies Act / IP / Real Estate (6)
1. AOC-4 + MGT-7 filed within 30 days / 60 days of AGM?
2. Board meetings (≥4) and AGM in time?
3. Statutory registers updated; CSR (if applicable) report filed?
4. OEM trademark used per dealer agreement; no infringement?
5. Lease deed registered + stamped; renewal tracker?
6. CSR (if net-worth/profit/turnover thresholds crossed) policy + 2% spend?

---

## 5. PENALTY SCHEDULE (illustrative, for risk scoring)

| Area | Penalty | Notes |
|---|---|---|
| Trade Certificate violation (driving unregistered vehicle without TC) | ₹1,000-5,000 + seizure under MV Act §177 | Plus suspension under CMVR Rule 44 |
| HSRP non-fitment | ₹5,000-10,000 (Section 192) | Delhi enforces strictly |
| Factories Act / OSH non-compliance | Up to ₹5 lakh; imprisonment up to 2 yrs for hazardous-process breach | OSH Code largely decriminalised general defaults |
| EPF default | 12% interest p.a. + 5-25% damages u/s 14B | Plus criminal for diverted contributions |
| ESI default | 12% interest + damages | Inspection-driven |
| GST late filing | ₹50/day (₹20 nil); Sec 73/74 demand + penalty up to 100% | E-way bill default ₹10,000 or tax-due, higher |
| TCS u/s 206C non-collection | Equal to TCS amount + 1% interest p.m. | Plus disallowance |
| HW Rules / SPCB violation | ₹1 lakh – ₹1 crore EC; closure under Sec 5 EPA; imprisonment up to 5 yrs | EC quantum per CPCB guidelines |
| Battery / E-Waste / ELV non-compliance | Environmental Compensation per CPCB schedule; cancellation of registration | Polluter-pays |
| ELV producer contravention | ₹10 lakh – ₹15 lakh per contravention; ₹10 lakh continuing penalty; up to 3 yr imprisonment on default in payment | Per ELV Rules 2025 |
| PESO licence breach | Up to ₹50,000 + closure | Petroleum Act §23 |
| Fire NOC absence | Sealing + ₹10,000-1 lakh state-variable | |
| POSH non-constitution of IC | ₹50,000 first; cancellation of licence on repeat | |
| BIS Act (selling non-ISI helmet/tyre) | Up to ₹2 lakh / 2 yrs imprisonment + product seizure | |
| Consumer Protection (CCPA misleading ad) | Up to ₹10 lakh first / ₹50 lakh subsequent | |
| MISP guideline breach | Cancellation of MISP + insurer/intermediary penalty up to ₹1 cr u/s 102 Insurance Act | EoM/Commission regulatory action against sponsor possible |
| DPDP breach | Up to ₹250 cr (security safeguards), ₹200 cr (breach notification / children's data), ₹50 cr (any other violation) | Per-violation; cumulative exposure possible. Effective 13 May 2027 |
| Companies Act default | ₹50,000 + ₹500/day continuing | |

---

## 6. RECENT CHANGES (2023-2026) DEALERS MUST ADAPT TO

1. **Labour Codes effective 21 Nov 2025** — central rules in draft (gazette 30 Dec 2025); state rules expected by ~Apr 2026.
2. **DPDP Rules notified 14 Nov 2025** — phased: DPB live; consent managers Nov 2026; substantive compliance May 2027.
3. **GST 2.0 (effective 22 Sep 2025)** — vehicle slabs simplified to 18% (small cars / 2W ≤350cc / buses-trucks-3W) and 40% (mid/large cars / 2W >350cc); cess subsumed; auto parts uniform 18%; EVs 5%; FADA litigation ongoing on transitional cess credit treatment.
4. **TCS u/s 206C(1F) — broadened from 22 Apr 2025** to 10 luxury goods (apart from motor vehicles); threshold ₹10 lakh per single item; rate 1%.
5. **End-of-Life Vehicles Rules 2025** — eff. **1 Apr 2025**; first producer declarations due 30 Apr 2026 for FY26.
6. **Battery Waste Management (Amdt) Rules 2025** — 24 Feb 2025.
7. **CMVR Trade Certificate reform** — Form 16A introduced; e-Trade Certificate; Form 19A digital inventory (eff 1 Nov 2022 — fully entrenched now).
8. **Bharat NCAP** live since 1 Oct 2023; major upgrade (incl. ADAS testing) announced for Oct 2027.
9. **CAFE-III** — effective FY 2027-28.
10. **BS-VI Phase II** live 1 Apr 2023; OBD-II RDE compliance.
11. **HSRP retro-fit** — Maharashtra deadline 30 Jun 2025; rolling deadlines elsewhere.
12. **Right to Repair portal** — automobile sector formally onboarded Jul 2024.
13. **PM E-DRIVE** scheme live 29 Sep 2024 — successor to FAME-II.
14. **Karnataka PT exemption** raised to ₹25,000/m wef 1 Apr 2025.
15. **Maharashtra MPCB** moved 850 industries to White Category Feb 2026 — verify if any sub-process of dealership benefits.
16. **CCI assumes anti-profiteering jurisdiction** wef 1 Apr 2025.
17. **IRDAI EoM Regulations 2024** — eff. 1 Apr 2024, consolidated commission + EoM; specific MISP distribution-fee caps withdrawn; 30%/35% insurer-level EoM cap.

---

## 7. RECOMMENDED DOCUMENTATION CHECKLIST (audit-ready)

**Statutory Registrations & Licences**
- PAN, TAN, GSTINs (per state), CIN/LLPIN, IEC (if importing).
- Shops & Establishments registration certificate(s).
- Factory Licence (Form 4) — if workshop crosses threshold.
- Trade Licence (ULB).
- Trade Certificate (Form 17) — VAHAN download; Form 16A; Form 19A inventory snapshot.
- EPF & ESI registration; EPF Form 5A.
- PT Registration (PTRC) and Enrolment (PTEC) per state.
- BOCW (if recently constructed).
- POSH IC constitution order; annual report acknowledgment.
- CTE & CTO certificates (Water + Air); HW Authorisation.
- CPCB Battery / EWaste / ELV portal acknowledgments.
- PESO Form XIV/XV/XVI; Fire NOC; Lift Licence.
- MISP appointment letter; UIN; sponsor agreement.
- DSA agreements with banks/NBFCs.
- Building Plan Approval; Occupancy Certificate; Lease Deed (registered).
- Lifts & Escalators registration.

**Returns / Filings**
- GSTR-1, 3B, 9, 9C, e-way bill ledger.
- TDS 24Q/26Q/27EQ; Form 16/16A/27D issuances.
- Income-tax return + tax audit report 3CD (if applicable).
- AOC-4, MGT-7, DPT-3, DIR-3 KYC.
- EPF ECR, ESI Return.
- PT challan + return (state-format).
- Factories Form 21 (half-yearly), Form 22 (annual), Form 18 (accident).
- HW Form 4 annual; BWM/EWM/PW returns; ELV Form 1/2/3; CTO renewal compliance report.
- MISP records (7 yrs).
- POSH annual report.
- Bonus payment register; gratuity provisioning.

**Operational Registers**
- Form 19A (VAHAN inventory) and physical match log.
- Vehicle delivery file (Form 20/21/22; HSRP affixation; insurance copy; finance NOC; PUC).
- Customer KYC and DPDP consent record.
- Workshop job cards; HW manifest log; PPE issue register; lift/hoist test certificates; PESO competent-person reports.
- Wage register (Form X), attendance, leave, OT.
- Training calendar — POSH, fire, EHS, OEM SOP.

---

## 8. SOURCES & OFFICIAL REFERENCES

- **labour.gov.in** (Ministry of Labour & Employment) — Labour Codes notifications (PIB PRID 2192463, 21 Nov 2025); corrigendum 19 Dec 2025; draft central rules gazette 30 Dec 2025.
- **morth.nic.in** + **parivahan.gov.in / VAHAN** — CMVR notifications (GSR 703(E) 14 Sep 2022 on Trade Certificate); RVSF Rules; HSRP rules.
- **bncap.in** — Bharat NCAP (AIS-197) protocols.
- **cpcb.nic.in** — pollution categorisation; HW Rules 2016; EWM Rules 2022.
- **eprbattery.cpcb.gov.in** — Battery Waste EPR portal.
- **moef.gov.in** — Battery Waste Mgmt Rules 2022; ELV Rules 2025 (S.O. 98(E) 6 Jan 2025).
- **peso.gov.in** — Petroleum Rules 2002, SMPV Rules 2016, Gas Cylinder Rules 2016.
- **bis.gov.in** — IS standards for helmets (IS 4151), tyres, batteries, seat belts; QCOs.
- **irdai.gov.in** — MISP Guidelines 31 Aug 2017 (eff. 1 Nov 2017); Circular on Payment of Distribution Fees to MISP (2023, removed §15(5)(c)); IRDAI (EoM, including Commission, of Insurers) Regulations 2024 (eff. 1 Apr 2024); MISP Committee Report 2021.
- **rbi.org.in** — Master Direction on Outsourcing of Financial Services 2023; KYC Master Direction.
- **consumeraffairs.nic.in** — CP Act 2019; CCPA; **righttorepairindia.gov.in**.
- **incometaxindia.gov.in** — Section 206C(1F) provisions; Finance (No. 2) Act 2024 amendment; CBDT Notification 36/2025 dt. 22 Apr 2025 (luxury goods); CBDT Circular 22/2016 + 17/2020.
- **gst.gov.in** + **PIB PRID 2164587** — 56th GST Council (3 Sep 2025) decisions; GST 2.0 effective 22 Sep 2025.
- **meity.gov.in** — DPDP Act 2023 + DPDP Rules 2025 (gazette 14 Nov 2025).
- **mca.gov.in** — Companies Act 2013 filings.
- State portals — *e-Karmika* (KA), *MahaShramm* (MH), *LMS* (TN), *Telangana Labour Dept*, *DPCC* (Delhi), *MPCB*, *KSPCB*, *TNPCB*, *GPCB*, *UPPCB*, *WBPCB*, *HSPCB*, *RSPCB*, *KSPCB-Kerala*, *PPCB*.
- **fada.in** — Federation of Automobile Dealers Associations (founded 1964; ~15,000 dealers / 30,000 outlets); FADA Auto Dealer Protection Act draft (2021); GST Advisory dt. 23 Aug 2025.
- **siam.in** — SIAM (manufacturers) — model recall, BS-VI, ELV inputs.
- **acmaindia.org** — ACMA (component industry).
- Industry advisories: KPMG, EY, BDO, PwC, Cyril Amarchand, DLA Piper, JSA, Tuli & Co (DPDP, Labour Codes, ELV, EoM).

---

## 9. NOTES ON UNCERTAINTIES / FLAGS FOR PRODUCT DESIGN

- The **Labour Code central and state rules** are still being finalised (some states had only draft rules at end-2025; Govt has indicated final rules by ~Apr 2026). Until final state rules are gazetted, **legacy Acts continue alongside the Codes**, creating a *dual regime*. Your assessment should let users select "old + new" mode and flag where forms differ.
- **DPDP substantive obligations** are not enforceable until 13 May 2027 — risk-score should reflect "soft deadline" rather than current penalty exposure.
- **GST 2.0 transitional cess credit** continues to evolve with FADA/insurer litigation; the assessment should pull current GST rates from a refresh table rather than hard-code rates that may shift again.
- Whether vehicle servicing constitutes "manufacturing process" is settled in case law (yes, generally), but the *predominant activity test* means a small showroom-with-tiny-workshop may still be a "shop". Provide guidance, not a black-and-white pass/fail.
- **Demo-vehicle ITC** — courts/AAR rulings are mixed; flag as a risk, not a definitive obligation.
- **MISP commission caps** — the legacy 22.5%/19.5% caps are *no longer regulatory* but persist as a *commercial benchmark* in many sponsor agreements; assessment should ask "is your distribution fee in line with your sponsor's Board-approved EoM-Reg-2024 policy?" rather than "is it within the IRDAI cap?"
- The applicability table for state-specific items (PT, S&E, fire NOC) needs to be a maintained data set; states amend slabs nearly every Budget cycle.

---

## 10. RECOMMENDED ASSESSMENT ARCHITECTURE

This research can directly seed a 6-phase ComplianceCheck assessment in the following architecture:

- **Phase 1 — Applicability filter (25 questions)** → branches A/B/C/…
- **Phase 2 — Generic statutory** (Labour, EPF, ESI, S&E, POSH, GST, TDS) ~30 questions
- **Phase 3 — Workshop-EHS** (Factories/OSH, SPCB, HW, PESO, Fire, lifts) ~25 questions [skipped for showroom-only outlets]
- **Phase 4 — Auto-dealer-specific** (Trade Certificate, HSRP, BNCAP disclosure, BIS, CP, Right to Repair, MISP, DSA) ~20 questions
- **Phase 5 — EPR & circular-economy** (Battery, EWaste, ELV, used-oil) ~10 questions
- **Phase 6 — Data & corporate** (DPDP, Companies Act, CSR, lease) ~10 questions

A 12-employee single-outlet 2-wheeler dealer (no workshop services beyond minor) without diesel storage and contract labour will receive ~30 questions; a 300-employee 4-wheeler multi-outlet dealer with full body-shop and EV charging will receive the full ~100. Risk scoring can be weighted by the penalty schedule above so a Trade Certificate breach or HW non-compliance dominates, while a deferred DPDP item nudges only a "prepare-by-2027" advisory.

---

## CHANGE LOG (v1.0 → v1.1)

| Section | Change |
|---|---|
| §1 (Exec Summary, item 6) | Replaced "ITC blocked on demo cars" with corrected GST 2.0 framing (18%/40%, no 50% slab) |
| §1 (Exec Summary, item 7) | MISP — cap regime corrected: 22.5%/19.5% caps **withdrawn**; replaced by IRDAI EoM Regulations 2024 |
| §1 (Exec Summary, item 10) | DPDP Rules notification date corrected to 14 Nov 2025 |
| §A.15 (DPDP) | Notification date corrected; penalty ceilings restated precisely (₹250cr / ₹200cr / ₹50cr per-violation) |
| §A.16 (GST) | Full rewrite for GST 2.0 effective 22 Sep 2025 — added rate table; removed erroneous 50% slab; clarified TCS notification 36/2025 |
| §B.22 (IRDAI MISP) | Full rewrite — caps withdrawn (2023 circular removed §15(5)(c)); IRDAI EoM Regulations 2024 detailed; legacy caps now flagged as commercial benchmark only |
| §4.8 (GST/TCS questions) | Added GST 2.0 rate-application question and luxury-goods TCS question |
| §4.9 (MISP questions) | Reframed Q4 around insurer's Board-approved EoM-Reg-2024 policy (not the legacy cap) |
| §5 (Penalty Schedule) | DPDP penalty restated correctly per-violation; ELV producer penalties added |
| §6 (Recent Changes) | DPDP date corrected; GST 2.0 rates corrected; IRDAI EoM Regs 2024 added |
| §8 (Sources) | Added IRDAI 2023 distribution-fee circular; PIB GST 2.0 release; CBDT Notification 36/2025 |
| §D (State Annexure) | PT slab specifics moved to "verify current" placeholders to avoid stale data |
