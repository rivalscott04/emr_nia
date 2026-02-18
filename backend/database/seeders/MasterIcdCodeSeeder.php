<?php

namespace Database\Seeders;

use App\Models\MasterIcdCode;
use Illuminate\Database\Seeder;

class MasterIcdCodeSeeder extends Seeder
{
    /**
     * Seed a practical starter set of ICD master data.
     */
    public function run(): void
    {
        // Nama pakai format Indonesia (English) agar search kode/nama Indonesia & Inggris ketemu
        $icd10 = [
            ['code' => 'A09', 'name' => 'Diare / Gastroenteritis (Infectious gastroenteritis and colitis, unspecified)'],
            ['code' => 'A15', 'name' => 'TBC Respiratori (Respiratory tuberculosis)'],
            ['code' => 'A90', 'name' => 'DBD Klasik (Dengue fever [classical dengue])'],
            ['code' => 'A91', 'name' => 'DBD Hemoragik (Dengue haemorrhagic fever)'],
            ['code' => 'B01', 'name' => 'Cacar air (Varicella [chickenpox])'],
            ['code' => 'B34.9', 'name' => 'Infeksi virus (Viral infection, unspecified)'],
            ['code' => 'D50.9', 'name' => 'Anemia defisiensi besi (Iron deficiency anaemia, unspecified)'],
            ['code' => 'D64.9', 'name' => 'Anemia (Anaemia, unspecified)'],
            ['code' => 'E11', 'name' => 'DM Tipe 2 (Type 2 diabetes mellitus)'],
            ['code' => 'E11.9', 'name' => 'DM Tipe 2 tanpa komplikasi (Type 2 diabetes mellitus without complications)'],
            ['code' => 'E14.9', 'name' => 'DM tanpa komplikasi (Unspecified diabetes mellitus without complications)'],
            ['code' => 'E66.9', 'name' => 'Obesitas (Obesity, unspecified)'],
            ['code' => 'E78.5', 'name' => 'Hiperlipidemia (Hyperlipidaemia, unspecified)'],
            ['code' => 'F32.9', 'name' => 'Depresi (Depressive episode, unspecified)'],
            ['code' => 'F41.9', 'name' => 'Gangguan cemas (Anxiety disorder, unspecified)'],
            ['code' => 'G43.9', 'name' => 'Migren (Migraine, unspecified)'],
            ['code' => 'G44.2', 'name' => 'Sakit kepala tipe tegang (Tension-type headache)'],
            ['code' => 'H10.9', 'name' => 'Konjungtivitis (Conjunctivitis, unspecified)'],
            ['code' => 'H60.9', 'name' => 'Otitis eksterna (Otitis externa, unspecified)'],
            ['code' => 'H66.9', 'name' => 'Otitis media (Otitis media, unspecified)'],
            ['code' => 'I10', 'name' => 'Hipertensi (Essential (primary) hypertension)'],
            ['code' => 'I11.9', 'name' => 'Penyakit jantung hipertensi (Hypertensive heart disease without heart failure)'],
            ['code' => 'I20.9', 'name' => 'Angina pektoris (Angina pectoris, unspecified)'],
            ['code' => 'I25.9', 'name' => 'Penyakit jantung iskemik kronik (Chronic ischaemic heart disease, unspecified)'],
            ['code' => 'I50.9', 'name' => 'Gagal jantung (Heart failure, unspecified)'],
            ['code' => 'J00', 'name' => 'Common cold / Nasofaringitis akut (Acute nasopharyngitis)'],
            ['code' => 'J02.9', 'name' => 'Faringitis akut (Acute pharyngitis, unspecified)'],
            ['code' => 'J03.9', 'name' => 'Tonsilitis akut (Acute tonsillitis, unspecified)'],
            ['code' => 'J06.9', 'name' => 'ISPA (Acute upper respiratory infection, unspecified)'],
            ['code' => 'J11.1', 'name' => 'Influenza (Influenza with other respiratory manifestations, virus not identified)'],
            ['code' => 'J18.9', 'name' => 'Pneumonia (Pneumonia, unspecified organism)'],
            ['code' => 'J20.9', 'name' => 'Bronkitis akut (Acute bronchitis, unspecified)'],
            ['code' => 'J45.9', 'name' => 'Asma (Asthma, unspecified)'],
            ['code' => 'K02.9', 'name' => 'Karies gigi (Dental caries, unspecified)'],
            ['code' => 'K04.7', 'name' => 'Abses periapikal (Periapical abscess without sinus)'],
            ['code' => 'K21.9', 'name' => 'GERD (Gastro-oesophageal reflux disease without oesophagitis)'],
            ['code' => 'K29.7', 'name' => 'Gastritis (Gastritis, unspecified)'],
            ['code' => 'K30', 'name' => 'Dispepsia (Functional dyspepsia)'],
            ['code' => 'K52.9', 'name' => 'Gastroenteritis non-infeksi (Noninfective gastroenteritis and colitis, unspecified)'],
            ['code' => 'K59.0', 'name' => 'Konstipasi (Constipation)'],
            ['code' => 'L20.9', 'name' => 'Dermatitis atopik (Atopic dermatitis, unspecified)'],
            ['code' => 'L23.9', 'name' => 'Dermatitis kontak alergi (Allergic contact dermatitis, unspecified cause)'],
            ['code' => 'L50.9', 'name' => 'Urtikaria (Urticaria, unspecified)'],
            ['code' => 'L70.9', 'name' => 'Akne (Acne, unspecified)'],
            ['code' => 'M10.9', 'name' => 'Gout (Gout, unspecified)'],
            ['code' => 'M25.5', 'name' => 'Nyeri sendi (Pain in joint)'],
            ['code' => 'M54.5', 'name' => 'Nyeri punggung bawah (Low back pain)'],
            ['code' => 'M79.1', 'name' => 'Myalgia / Nyeri otot (Myalgia)'],
            ['code' => 'N30.9', 'name' => 'Sistitis (Cystitis, unspecified)'],
            ['code' => 'N39.0', 'name' => 'ISK (Urinary tract infection, site not specified)'],
            ['code' => 'N40', 'name' => 'Hiperplasia prostat (Hyperplasia of prostate)'],
            ['code' => 'N76.0', 'name' => 'Vaginitis akut (Acute vaginitis)'],
            ['code' => 'O80', 'name' => 'Persalinan spontan (Single spontaneous delivery)'],
            ['code' => 'R05', 'name' => 'Batuk (Cough)'],
            ['code' => 'R07.4', 'name' => 'Nyeri dada (Chest pain, unspecified)'],
            ['code' => 'R10.4', 'name' => 'Nyeri perut (Other and unspecified abdominal pain)'],
            ['code' => 'R11', 'name' => 'Mual muntah (Nausea and vomiting)'],
            ['code' => 'R19.7', 'name' => 'Diare (Diarrhoea, unspecified)'],
            ['code' => 'R42', 'name' => 'Vertigo (Dizziness and giddiness)'],
            ['code' => 'R50.9', 'name' => 'Demam (Fever, unspecified)'],
            ['code' => 'R51', 'name' => 'Sakit kepala (Headache)'],
            ['code' => 'R53', 'name' => 'Lemas / Kelelahan (Malaise and fatigue)'],
            ['code' => 'S09.9', 'name' => 'Cedera kepala (Unspecified injury of head)'],
            ['code' => 'T14.9', 'name' => 'Cedera (Injury, unspecified)'],
            ['code' => 'Z00.0', 'name' => 'Pemeriksaan kesehatan umum (General medical examination)'],
            ['code' => 'Z09', 'name' => 'Kontrol setelah pengobatan (Follow-up examination after treatment)'],
            ['code' => 'Z23', 'name' => 'Imunisasi (Need for immunization)'],
            ['code' => 'Z76.0', 'name' => 'Resep berulang (Issue of repeat prescription)'],
        ];

        // Prosedur: format Indonesia (English), minimal yang sangat umum
        $icd9 = [
            // Neurologi & cairan
            ['code' => '03.91', 'name' => 'Tusuk lumbal diagnostik (Diagnostic lumbar puncture)'],
            // Vaskuler & dialisis
            ['code' => '38.93', 'name' => 'Pemasangan infus / Kateter vena (Venous catheterization)'],
            ['code' => '39.95', 'name' => 'Hemodialisis (Hemodialysis)'],
            // Endoskopi & bedah digestif
            ['code' => '45.13', 'name' => 'EGD / Endoskopi saluran cerna atas (Esophagogastroduodenoscopy [EGD])'],
            ['code' => '45.23', 'name' => 'Kolonoskopi (Colonoscopy)'],
            ['code' => '47.09', 'name' => 'Apendektomi (Other appendectomy)'],
            ['code' => '49.01', 'name' => 'Insisi drainase abses perianal (Incision of perianal abscess)'],
            ['code' => '51.22', 'name' => 'Kolesistektomi terbuka (Open cholecystectomy)'],
            ['code' => '51.23', 'name' => 'Kolesistektomi laparoskopik (Laparoscopic cholecystectomy)'],
            ['code' => '54.21', 'name' => 'Laparoskopi (Laparoscopy)'],
            ['code' => '54.91', 'name' => 'Laparotomi (Laparotomy)'],
            // Urologi & ginjal
            ['code' => '57.94', 'name' => 'Kateter urine / Kateterisasi vesika (Insertion of indwelling urinary catheter)'],
            // Obstetri & ginekologi
            ['code' => '66.01', 'name' => 'Salpingotomi (Salpingotomy)'],
            ['code' => '69.02', 'name' => 'Dilatasi dan kuretase / Kuret (Dilation and curettage following delivery or abortion)'],
            ['code' => '73.59', 'name' => 'Persalinan dengan bantuan (Other manually assisted delivery)'],
            ['code' => '74.1', 'name' => 'Sectio caesarea / SC (Low cervical cesarean section)'],
            // Ortopedi
            ['code' => '78.59', 'name' => 'Fiksasi internal tulang (Internal fixation of bone without fracture reduction)'],
            ['code' => '79.35', 'name' => 'ORIF femur (Open reduction of fracture with internal fixation, femur)'],
            // Luka & kulit
            ['code' => '86.22', 'name' => 'Debridemen luka (Excisional debridement of wound, infection, or burn)'],
            ['code' => '86.59', 'name' => 'Jahit luka / Sutur (Other repair of skin and subcutaneous tissue)'],
            // Pencitraan
            ['code' => '87.03', 'name' => 'CT scan kepala (Computerized axial tomography of head)'],
            ['code' => '87.41', 'name' => 'MRI kepala (Magnetic resonance imaging of brain)'],
            ['code' => '88.01', 'name' => 'CT scan abdomen (Computerized axial tomography of abdomen)'],
            ['code' => '88.72', 'name' => 'Ekokardiografi / USG jantung (Diagnostic ultrasound of heart)'],
            ['code' => '88.76', 'name' => 'USG abdomen (Diagnostic ultrasound of abdomen)'],
            ['code' => '88.79', 'name' => 'USG lain (Other diagnostic ultrasound)'],
            // Lab & fungsi
            ['code' => '89.26', 'name' => 'EEG (Electroencephalogram)'],
            ['code' => '89.52', 'name' => 'EKG / Elektrokardiogram (Electrocardiogram)'],
            ['code' => '89.69', 'name' => 'Spirometri / Tes fungsi paru (Spirometry)'],
            ['code' => '90.59', 'name' => 'Pemeriksaan darah (Examination of blood)'],
            // Respirasi & jalan napas
            ['code' => '93.90', 'name' => 'CPAP (Continuous positive airway pressure)'],
            ['code' => '93.99', 'name' => 'Nebulizer / Terapi inhalasi (Other respiratory therapy)'],
            ['code' => '96.04', 'name' => 'Intubasi endotrakeal (Insertion of endotracheal tube)'],
            ['code' => '96.07', 'name' => 'NGT / Pemasangan selang nasogastrik (Insertion of nasogastric tube)'],
            ['code' => '96.35', 'name' => 'CPAP non-invasif (Continuous positive airway pressure)'],
            ['code' => '96.55', 'name' => 'BiPAP / Ventilasi non-invasif (Noninvasive mechanical ventilation)'],
            ['code' => '96.71', 'name' => 'Ventilasi mekanik invasif <96 jam (Continuous invasive mechanical ventilation for less than 96 consecutive hours)'],
            ['code' => '96.72', 'name' => 'Ventilasi mekanik invasif ≥96 jam (Continuous invasive mechanical ventilation for 96 consecutive hours or more)'],
            // Toraks & drainase
            ['code' => '34.91', 'name' => 'Torakosentesis / Tusuk dada (Thoracentesis)'],
            // Transfusi & injeksi
            ['code' => '99.04', 'name' => 'Transfusi PRC (Transfusion of packed cells)'],
            ['code' => '99.15', 'name' => 'Infus trombolitik (Injection or infusion of thrombolytic agent)'],
            ['code' => '99.21', 'name' => 'Suntik antibiotik (Injection of antibiotic)'],
            ['code' => '99.29', 'name' => 'Suntik / infus obat lain (Injection or infusion of other therapeutic or prophylactic substance)'],
        ];

        foreach ($icd10 as $item) {
            MasterIcdCode::query()->updateOrCreate(
                ['type' => 'ICD-10', 'code' => $item['code']],
                ['name' => $item['name'], 'is_active' => true]
            );
        }

        foreach ($icd9 as $item) {
            MasterIcdCode::query()->updateOrCreate(
                ['type' => 'ICD-9', 'code' => $item['code']],
                ['name' => $item['name'], 'is_active' => true]
            );
        }
    }
}
