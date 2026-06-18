export type Discipline = "OT" | "PT" | "SLP";
export type InjuryType = "TBI" | "SCI" | "rotator_cuff" | "low_back" | "CVA" | "hand";

export interface DictationSample {
  id: string;
  label: string;
  discipline: Discipline;
  injury_type: InjuryType;
  wsib_code: string;
  dictation: string;
}

export const syntheticDictations: DictationSample[] = [
  {
    id: "tbi-ot-home",
    label: "TBI — OT In-Home Follow-Up",
    discipline: "OT",
    injury_type: "TBI",
    wsib_code: "5101",
    dictation: `Saw Alex at his home on June 10th. He reports headaches four out of ten at rest, worse with concentration. Wife says he's more irritable and has trouble starting his morning routine. He tells me he can start making coffee but forgets the steps in the middle. Did the three-step breakfast task today — eggs on toast — he needed four verbal cues and took 34 minutes. Last time it was seven cues so that's progress. Did cognitive assessment, memory was 7 out of 12, attention 6 out of 12. Grip strength right hand 28 pounds, left 31. He's left dominant. His home exercise program compliance was three out of seven days. I worked on backward chaining and energy conservation. Posted visual cue cards in the kitchen. Plan is to introduce medication management next week and refer to psychology for fatigue. Seeing him weekly for another four weeks.`,
  },
  {
    id: "rotator-cuff-pt-home",
    label: "Rotator Cuff — PT In-Home Follow-Up",
    discipline: "PT",
    injury_type: "rotator_cuff",
    wsib_code: "P201",
    dictation: `Home visit with Maria today, June 11th. She's reporting left shoulder pain five out of ten at rest, goes up to eight when reaching overhead. She can get to the second shelf but not above her head. Still can't sleep on the left side. Exercise compliance was five out of seven days and her technique looked good. Active range of motion — flexion to 135, abduction 125, external rotation 40, internal rotation 60. That's up from 120 flexion last week. Manual muscle testing supraspinatus 3 plus out of 5, infraspinatus 4 minus. Hawkins Kennedy positive. Did ultrasound and manual therapy to the posterior capsule, then did progressive strengthening with the Theraband. Plan is to move up a Theraband resistance, add some eccentric loading, and see her twice a week for three more weeks. Need to complete Form 26 for WSIB today.`,
  },
  {
    id: "sci-ot-home",
    label: "SCI T6 — OT Wheelchair Seating Assessment",
    discipline: "OT",
    injury_type: "SCI",
    wsib_code: "5101",
    dictation: `Assessment visit at Robert's home on June 12th. He has T6 complete paraplegia from a workplace incident eight months ago. Referred for wheelchair seating and ADL retraining. He reports pressure sore developing on right ischial tuberosity, rates discomfort as 6 out of 10 after two hours in chair. Current wheelchair is hospital-issue, not custom. Upper body strength — shoulder flexors and extensors bilaterally 5 out of 5. Elbow 5 out of 5. Wrist extensors 5 out of 5, no hand intrinsics. Skin inspection shows 2 centimetre stage 2 pressure injury right ischium, no undermining. ADL assessment — independent with upper body dressing, requires setup assistance for lower body. Transfers — independent sliding board, can manage car transfers with adapted technique. Recommended custom power-tilt wheelchair with pressure-relief cushion, refer to seating clinic. Plan to see twice monthly for ADL training and skin management education.`,
  },
  {
    id: "low-back-ot-clinic",
    label: "Low Back RSI — OT Functional Capacity Evaluation",
    discipline: "OT",
    injury_type: "low_back",
    wsib_code: "5100",
    dictation: `Functional capacity evaluation with David at our clinic on June 13th. Low back RSI from repetitive lifting on the line at the plant. He's been off for six weeks. Reports pain 3 out of 10 at rest, 7 out of 10 with bending and lifting. No radiation down the legs. Lumbar flexion to 65 degrees, extension 15 degrees, lateral flexion right 20 left 18. Straight leg raise negative bilaterally. Did the EPIC lift capacity test — safely lifted 20 kg from floor to knuckle height, 15 kg knuckle to shoulder. Employer has a modified duties program — light assembly work, no lifting over 10 kg, sitting and standing alternating every 30 minutes. Based on today's assessment David can return to modified duties next Monday. He should not lift more than 10 kg, avoid repetitive bending, and have the alternating sit-stand schedule. I'll complete Form 8 for WSIB and the functional abilities form today. Follow-up in three weeks to reassess for full duties.`,
  },
];
