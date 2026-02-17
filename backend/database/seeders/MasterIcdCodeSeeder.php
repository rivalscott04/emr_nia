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
        $icd10 = [
            ['code' => 'A09', 'name' => 'Infectious gastroenteritis and colitis, unspecified'],
            ['code' => 'A15', 'name' => 'Respiratory tuberculosis'],
            ['code' => 'A90', 'name' => 'Dengue fever [classical dengue]'],
            ['code' => 'A91', 'name' => 'Dengue haemorrhagic fever'],
            ['code' => 'B01', 'name' => 'Varicella [chickenpox]'],
            ['code' => 'B34.9', 'name' => 'Viral infection, unspecified'],
            ['code' => 'D50.9', 'name' => 'Iron deficiency anaemia, unspecified'],
            ['code' => 'D64.9', 'name' => 'Anaemia, unspecified'],
            ['code' => 'E11', 'name' => 'Type 2 diabetes mellitus'],
            ['code' => 'E11.9', 'name' => 'Type 2 diabetes mellitus without complications'],
            ['code' => 'E14.9', 'name' => 'Unspecified diabetes mellitus without complications'],
            ['code' => 'E66.9', 'name' => 'Obesity, unspecified'],
            ['code' => 'E78.5', 'name' => 'Hyperlipidaemia, unspecified'],
            ['code' => 'F32.9', 'name' => 'Depressive episode, unspecified'],
            ['code' => 'F41.9', 'name' => 'Anxiety disorder, unspecified'],
            ['code' => 'G43.9', 'name' => 'Migraine, unspecified'],
            ['code' => 'G44.2', 'name' => 'Tension-type headache'],
            ['code' => 'H10.9', 'name' => 'Conjunctivitis, unspecified'],
            ['code' => 'H60.9', 'name' => 'Otitis externa, unspecified'],
            ['code' => 'H66.9', 'name' => 'Otitis media, unspecified'],
            ['code' => 'I10', 'name' => 'Essential (primary) hypertension'],
            ['code' => 'I11.9', 'name' => 'Hypertensive heart disease without heart failure'],
            ['code' => 'I20.9', 'name' => 'Angina pectoris, unspecified'],
            ['code' => 'I25.9', 'name' => 'Chronic ischaemic heart disease, unspecified'],
            ['code' => 'I50.9', 'name' => 'Heart failure, unspecified'],
            ['code' => 'J00', 'name' => 'Acute nasopharyngitis [common cold]'],
            ['code' => 'J02.9', 'name' => 'Acute pharyngitis, unspecified'],
            ['code' => 'J03.9', 'name' => 'Acute tonsillitis, unspecified'],
            ['code' => 'J06.9', 'name' => 'Acute upper respiratory infection, unspecified'],
            ['code' => 'J11.1', 'name' => 'Influenza with other respiratory manifestations, virus not identified'],
            ['code' => 'J18.9', 'name' => 'Pneumonia, unspecified organism'],
            ['code' => 'J20.9', 'name' => 'Acute bronchitis, unspecified'],
            ['code' => 'J45.9', 'name' => 'Asthma, unspecified'],
            ['code' => 'K02.9', 'name' => 'Dental caries, unspecified'],
            ['code' => 'K04.7', 'name' => 'Periapical abscess without sinus'],
            ['code' => 'K21.9', 'name' => 'Gastro-oesophageal reflux disease without oesophagitis'],
            ['code' => 'K29.7', 'name' => 'Gastritis, unspecified'],
            ['code' => 'K30', 'name' => 'Functional dyspepsia'],
            ['code' => 'K52.9', 'name' => 'Noninfective gastroenteritis and colitis, unspecified'],
            ['code' => 'K59.0', 'name' => 'Constipation'],
            ['code' => 'L20.9', 'name' => 'Atopic dermatitis, unspecified'],
            ['code' => 'L23.9', 'name' => 'Allergic contact dermatitis, unspecified cause'],
            ['code' => 'L50.9', 'name' => 'Urticaria, unspecified'],
            ['code' => 'L70.9', 'name' => 'Acne, unspecified'],
            ['code' => 'M10.9', 'name' => 'Gout, unspecified'],
            ['code' => 'M25.5', 'name' => 'Pain in joint'],
            ['code' => 'M54.5', 'name' => 'Low back pain'],
            ['code' => 'M79.1', 'name' => 'Myalgia'],
            ['code' => 'N30.9', 'name' => 'Cystitis, unspecified'],
            ['code' => 'N39.0', 'name' => 'Urinary tract infection, site not specified'],
            ['code' => 'N40', 'name' => 'Hyperplasia of prostate'],
            ['code' => 'N76.0', 'name' => 'Acute vaginitis'],
            ['code' => 'O80', 'name' => 'Single spontaneous delivery'],
            ['code' => 'R05', 'name' => 'Cough'],
            ['code' => 'R07.4', 'name' => 'Chest pain, unspecified'],
            ['code' => 'R10.4', 'name' => 'Other and unspecified abdominal pain'],
            ['code' => 'R11', 'name' => 'Nausea and vomiting'],
            ['code' => 'R19.7', 'name' => 'Diarrhoea, unspecified'],
            ['code' => 'R42', 'name' => 'Dizziness and giddiness'],
            ['code' => 'R50.9', 'name' => 'Fever, unspecified'],
            ['code' => 'R51', 'name' => 'Headache'],
            ['code' => 'R53', 'name' => 'Malaise and fatigue'],
            ['code' => 'S09.9', 'name' => 'Unspecified injury of head'],
            ['code' => 'T14.9', 'name' => 'Injury, unspecified'],
            ['code' => 'Z00.0', 'name' => 'General medical examination'],
            ['code' => 'Z09', 'name' => 'Follow-up examination after treatment'],
            ['code' => 'Z23', 'name' => 'Need for immunization'],
            ['code' => 'Z76.0', 'name' => 'Issue of repeat prescription'],
        ];

        $icd9 = [
            ['code' => '03.91', 'name' => 'Diagnostic lumbar puncture'],
            ['code' => '39.95', 'name' => 'Hemodialysis'],
            ['code' => '45.13', 'name' => 'Esophagogastroduodenoscopy [EGD]'],
            ['code' => '45.23', 'name' => 'Colonoscopy'],
            ['code' => '47.09', 'name' => 'Other appendectomy'],
            ['code' => '51.23', 'name' => 'Laparoscopic cholecystectomy'],
            ['code' => '54.21', 'name' => 'Laparoscopy'],
            ['code' => '66.01', 'name' => 'Salpingotomy'],
            ['code' => '69.02', 'name' => 'Dilation and curettage following delivery or abortion'],
            ['code' => '73.59', 'name' => 'Other manually assisted delivery'],
            ['code' => '74.1', 'name' => 'Low cervical cesarean section'],
            ['code' => '78.59', 'name' => 'Internal fixation of bone without fracture reduction'],
            ['code' => '79.35', 'name' => 'Open reduction of fracture with internal fixation, femur'],
            ['code' => '86.22', 'name' => 'Excisional debridement of wound, infection, or burn'],
            ['code' => '87.03', 'name' => 'Computerized axial tomography of head'],
            ['code' => '88.01', 'name' => 'Computerized axial tomography of abdomen'],
            ['code' => '88.72', 'name' => 'Diagnostic ultrasound of heart'],
            ['code' => '89.52', 'name' => 'Electrocardiogram'],
            ['code' => '90.59', 'name' => 'Examination of blood'],
            ['code' => '96.04', 'name' => 'Insertion of endotracheal tube'],
            ['code' => '96.71', 'name' => 'Continuous invasive mechanical ventilation for less than 96 consecutive hours'],
            ['code' => '96.72', 'name' => 'Continuous invasive mechanical ventilation for 96 consecutive hours or more'],
            ['code' => '99.04', 'name' => 'Transfusion of packed cells'],
            ['code' => '99.15', 'name' => 'Injection or infusion of thrombolytic agent'],
            ['code' => '99.21', 'name' => 'Injection of antibiotic'],
            ['code' => '99.29', 'name' => 'Injection or infusion of other therapeutic or prophylactic substance'],
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
