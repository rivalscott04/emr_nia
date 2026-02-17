export interface ICD {
    code: string
    name: string
}

// ========================================
// Comprehensive ICD-10 Mock Data
// Common diagnoses for primary care / general practice
// ========================================

const MOCK_ICD10: ICD[] = [
    // Infectious Diseases
    { code: "A00", name: "Cholera" },
    { code: "A01.0", name: "Typhoid fever" },
    { code: "A01.4", name: "Paratyphoid fever, unspecified" },
    { code: "A09", name: "Infectious gastroenteritis and colitis, unspecified" },
    { code: "A15", name: "Respiratory tuberculosis" },
    { code: "A16", name: "Respiratory tuberculosis, not confirmed bacteriologically or histologically" },
    { code: "A90", name: "Dengue fever [classical dengue]" },
    { code: "A91", name: "Dengue haemorrhagic fever" },
    { code: "B00", name: "Herpesviral [herpes simplex] infections" },
    { code: "B01", name: "Varicella [chickenpox]" },
    { code: "B05", name: "Measles" },
    { code: "B15", name: "Acute hepatitis A" },
    { code: "B16", name: "Acute hepatitis B" },
    { code: "B35", name: "Dermatophytosis" },
    { code: "B37", name: "Candidiasis" },
    { code: "B82", name: "Intestinal parasitism, unspecified" },

    // Neoplasms (common referrals)
    { code: "C50", name: "Malignant neoplasm of breast" },
    { code: "D25", name: "Leiomyoma of uterus" },

    // Blood/Immune
    { code: "D50", name: "Iron deficiency anaemia" },
    { code: "D64.9", name: "Anaemia, unspecified" },

    // Endocrine/Metabolic
    { code: "E03", name: "Other hypothyroidism" },
    { code: "E05", name: "Thyrotoxicosis [hyperthyroidism]" },
    { code: "E10", name: "Type 1 diabetes mellitus" },
    { code: "E11", name: "Type 2 diabetes mellitus" },
    { code: "E11.5", name: "Type 2 diabetes mellitus with peripheral circulatory complications" },
    { code: "E11.9", name: "Type 2 diabetes mellitus without complications" },
    { code: "E14", name: "Unspecified diabetes mellitus" },
    { code: "E66", name: "Obesity" },
    { code: "E78", name: "Disorders of lipoprotein metabolism (Dyslipidemia)" },
    { code: "E78.0", name: "Pure hypercholesterolaemia" },
    { code: "E78.5", name: "Hyperlipidaemia, unspecified" },
    { code: "E79.0", name: "Hyperuricaemia (Gout, uric acid)" },
    { code: "E86", name: "Volume depletion (Dehydration)" },
    { code: "E87", name: "Other disorders of fluid, electrolyte and acid-base balance" },

    // Mental/Behavioral
    { code: "F32", name: "Depressive episode" },
    { code: "F41.0", name: "Panic disorder" },
    { code: "F41.1", name: "Generalized anxiety disorder" },
    { code: "F51.0", name: "Insomnia, nonorganic" },

    // Nervous System
    { code: "G40", name: "Epilepsy" },
    { code: "G43", name: "Migraine" },
    { code: "G44.1", name: "Vascular headache, not elsewhere classified" },
    { code: "G47.3", name: "Sleep apnoea" },

    // Eye
    { code: "H10", name: "Conjunctivitis" },
    { code: "H66", name: "Suppurative and unspecified otitis media" },
    { code: "H65", name: "Nonsuppurative otitis media" },

    // Ear
    { code: "H60", name: "Otitis externa" },
    { code: "H81.0", name: "Ménière disease" },
    { code: "H91.9", name: "Hearing loss, unspecified" },

    // Circulatory
    { code: "I10", name: "Essential (primary) hypertension" },
    { code: "I11", name: "Hypertensive heart disease" },
    { code: "I20", name: "Angina pectoris" },
    { code: "I21", name: "Acute myocardial infarction" },
    { code: "I25", name: "Chronic ischaemic heart disease" },
    { code: "I48", name: "Atrial fibrillation and flutter" },
    { code: "I50", name: "Heart failure" },
    { code: "I63", name: "Cerebral infarction (Stroke)" },
    { code: "I64", name: "Stroke, not specified as haemorrhage or infarction" },
    { code: "I83", name: "Varicose veins of lower extremities" },

    // Respiratory
    { code: "J00", name: "Acute nasopharyngitis [common cold]" },
    { code: "J01", name: "Acute sinusitis" },
    { code: "J02", name: "Acute pharyngitis" },
    { code: "J03", name: "Acute tonsillitis" },
    { code: "J06.9", name: "Acute upper respiratory infection, unspecified" },
    { code: "J10", name: "Influenza due to identified influenza virus" },
    { code: "J11", name: "Influenza, virus not identified" },
    { code: "J15", name: "Bacterial pneumonia, not elsewhere classified" },
    { code: "J18", name: "Pneumonia, organism unspecified" },
    { code: "J20", name: "Acute bronchitis" },
    { code: "J42", name: "Unspecified chronic bronchitis" },
    { code: "J44", name: "Other chronic obstructive pulmonary disease (COPD)" },
    { code: "J45", name: "Asthma" },

    // Digestive
    { code: "K02", name: "Dental caries" },
    { code: "K04", name: "Diseases of pulp and periapical tissues" },
    { code: "K21", name: "Gastro-oesophageal reflux disease (GERD)" },
    { code: "K25", name: "Gastric ulcer" },
    { code: "K26", name: "Duodenal ulcer" },
    { code: "K29", name: "Gastritis and duodenitis" },
    { code: "K30", name: "Functional dyspepsia" },
    { code: "K35", name: "Acute appendicitis" },
    { code: "K40", name: "Inguinal hernia" },
    { code: "K50", name: "Crohn disease" },
    { code: "K58", name: "Irritable bowel syndrome" },
    { code: "K59.0", name: "Constipation" },
    { code: "K76", name: "Other diseases of liver (Fatty liver)" },
    { code: "K80", name: "Cholelithiasis (Gallstones)" },
    { code: "K92.0", name: "Haematemesis" },
    { code: "K92.1", name: "Melaena" },

    // Skin
    { code: "L02", name: "Cutaneous abscess, furuncle and carbuncle" },
    { code: "L03", name: "Cellulitis" },
    { code: "L20", name: "Atopic dermatitis (Eczema)" },
    { code: "L23", name: "Allergic contact dermatitis" },
    { code: "L30", name: "Other dermatitis" },
    { code: "L40", name: "Psoriasis" },
    { code: "L50", name: "Urticaria" },
    { code: "L70", name: "Acne" },

    // Musculoskeletal
    { code: "M06", name: "Other rheumatoid arthritis" },
    { code: "M10", name: "Gout" },
    { code: "M15", name: "Polyarthrosis" },
    { code: "M17", name: "Gonarthrosis [arthrosis of knee]" },
    { code: "M25.5", name: "Pain in joint" },
    { code: "M54.2", name: "Cervicalgia (Neck pain)" },
    { code: "M54.4", name: "Lumbago with sciatica" },
    { code: "M54.5", name: "Low back pain" },
    { code: "M62.8", name: "Other specified disorders of muscle" },
    { code: "M79.1", name: "Myalgia" },
    { code: "M79.3", name: "Panniculitis, unspecified" },

    // Genitourinary
    { code: "N10", name: "Acute tubulo-interstitial nephritis (Pyelonephritis)" },
    { code: "N18", name: "Chronic kidney disease" },
    { code: "N20", name: "Calculus of kidney and ureter" },
    { code: "N30", name: "Cystitis" },
    { code: "N39.0", name: "Urinary tract infection, site not specified" },
    { code: "N40", name: "Hyperplasia of prostate (BPH)" },
    { code: "N76", name: "Other inflammation of vagina and vulva" },
    { code: "N92", name: "Excessive, frequent and irregular menstruation" },
    { code: "N94.6", name: "Dysmenorrhoea, unspecified" },

    // Pregnancy
    { code: "O80", name: "Single spontaneous delivery" },
    { code: "O99", name: "Other maternal diseases complicating pregnancy" },
    { code: "Z34", name: "Supervision of normal pregnancy" },

    // Perinatal
    { code: "P07", name: "Disorders related to short gestation and low birth weight" },

    // Symptoms/Signs (R codes — commonly used)
    { code: "R05", name: "Cough" },
    { code: "R06.0", name: "Dyspnoea" },
    { code: "R07.4", name: "Chest pain, unspecified" },
    { code: "R10", name: "Abdominal and pelvic pain" },
    { code: "R10.1", name: "Pain localized to upper abdomen" },
    { code: "R10.3", name: "Pain localized to other parts of lower abdomen" },
    { code: "R10.4", name: "Other and unspecified abdominal pain" },
    { code: "R11", name: "Nausea and vomiting" },
    { code: "R19.7", name: "Diarrhoea, unspecified" },
    { code: "R21", name: "Rash and other nonspecific skin eruption" },
    { code: "R42", name: "Dizziness and giddiness" },
    { code: "R50.9", name: "Fever, unspecified" },
    { code: "R51", name: "Headache" },
    { code: "R53", name: "Malaise and fatigue" },
    { code: "R55", name: "Syncope and collapse" },
    { code: "R73", name: "Elevated blood glucose level" },

    // Injury
    { code: "S00", name: "Superficial injury of head" },
    { code: "S01", name: "Open wound of head" },
    { code: "S52", name: "Fracture of forearm" },
    { code: "S62", name: "Fracture at wrist and hand level" },
    { code: "S82", name: "Fracture of lower leg, including ankle" },
    { code: "S93", name: "Dislocation, sprain and strain of ankle" },
    { code: "T14", name: "Injury of unspecified body region" },
    { code: "T78.4", name: "Allergy, unspecified" },

    // External Causes
    { code: "W19", name: "Unspecified fall" },

    // Health Status / Contact (Z codes)
    { code: "Z00", name: "General examination and investigation" },
    { code: "Z01", name: "Other special examinations and investigations" },
    { code: "Z09", name: "Follow-up examination after treatment" },
    { code: "Z23", name: "Need for immunization against single bacterial diseases" },
    { code: "Z76.0", name: "Issue of repeat prescription" },
]

// ========================================
// Frequently used diagnoses (quick-select)
// ========================================

export const FREQUENT_DIAGNOSES: ICD[] = [
    { code: "J06.9", name: "ISPA (Acute upper respiratory infection)" },
    { code: "I10", name: "Hipertensi (Essential hypertension)" },
    { code: "E11.9", name: "DM Tipe 2 tanpa komplikasi" },
    { code: "K30", name: "Dispepsia (Functional dyspepsia)" },
    { code: "K29", name: "Gastritis" },
    { code: "R50.9", name: "Demam (Fever, unspecified)" },
    { code: "R51", name: "Sakit kepala (Headache)" },
    { code: "M79.1", name: "Myalgia" },
    { code: "A09", name: "Diare (Gastroenteritis)" },
    { code: "N39.0", name: "ISK (Urinary tract infection)" },
    { code: "L50", name: "Urtikaria (Urticaria)" },
    { code: "R42", name: "Vertigo (Dizziness)" },
]

// ========================================
// Service
// ========================================

export const ICDService = {
    searchICD10: async (query: string): Promise<ICD[]> => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        if (!query) return []
        const q = query.toLowerCase()
        return MOCK_ICD10.filter(
            (item) =>
                item.code.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q)
        ).slice(0, 15) // Limit results for performance
    },

    getFrequent: async (): Promise<ICD[]> => {
        return FREQUENT_DIAGNOSES
    },
}
