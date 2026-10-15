/* Content copied from Denzel's Notion "Health Dashboard" + Sessions pages (fetched 2026-10-15). */
window.PLAN = {
  goal: "Fat loss to reveal abs. Start ~200 lb at 5'8\" → target ~165–170 lb at 1–1.5 lb/week (roughly 5–7 months).",
  targets: { kcal: 2000, protein: 175, fat: 56, carbs: 200, sodium: 2300, stepsMin: 8000, stepsMax: 10000 },
  rule: "Judge progress by the weekly average weight, not daily scale readings. If the weekly average hasn't dropped after 2 weeks, add a cardio session before cutting food.",
  weighIn: "Weigh in every morning (after bathroom, before food). Compare week over week: aim for −1 to −1.5 lb.",
  ramp: [
    { weeks: "Weeks 1–2", from: 1, lift: 3, split: "Mon Chest/Shoulders · Wed Back/Abs · Fri Legs/Arm", extras: "Lunch walks" },
    { weeks: "Weeks 3–4", from: 3, lift: 4, split: "Add Chest/Abs (Sat or Tue)", extras: "Add one 25-min incline walk" },
    { weeks: "Weeks 5–6", from: 5, lift: 5, split: "Add Back", extras: "" },
    { weeks: "Week 7+", from: 7, lift: 6, split: "Add Legs/Arms", extras: "" },
    { weeks: "Sunday", from: 0, lift: 0, split: "Rest / meal prep", extras: "" }
  ],
  logistics: [
    "Lunch walk: 20–30 min on every workday.",
    "Gym days: leave Oceanside ~5:00 PM → train at EōS Anaheim (~60 min) → sauna optional → home after 8 PM.",
    "Primary gym: EōS Anaheim, 2280 E Lincoln Ave (Tesla Supercharger next door). Backup: EōS Hawaiian Gardens, 12120 E Carson St."
  ],
  abRule: "Ab work 3x/week: Weighted cable crunches 3×12 · Hanging leg raises 3×10. Progress to 3×15, then add weight.",
  // Day schedule: weekday (0=Sun) -> session id + week unlocked
  schedule: [
    { dow: 1, session: "chest-shoulders", from: 1 },
    { dow: 3, session: "back-abs", from: 1 },
    { dow: 5, session: "legs-arm", from: 1 },
    { dow: 6, session: "chest-abs", from: 3 },
    { dow: 4, session: "back", from: 5 },
    { dow: 2, session: "legs-arms", from: 7, assumed: true } // Notion: Day = TBD; app places it on Tue (Sun stays rest)
  ],
  sessions: {
    "chest-shoulders": {
      name: "Chest / Shoulders", day: "Mon", unlocked: "Weeks 1-2", emoji: "💪🏾",
      progression: null,
      exercises: [
        { name: "Smith Machine Incline press", target: "3 x 8", sets: 3, reps: 8, img: "smith-incline-press.jpg" },
        { name: "Cable Low to High", target: "4 x 15", sets: 4, reps: 15, img: "cable-low-to-high.gif" },
        { name: "D.B. Shoulder press", target: "3 x 8", sets: 3, reps: 8, img: "db-shoulder-press.gif" },
        { name: "Lateral Raises", target: "5 x 15", sets: 5, reps: 15, img: "lateral-raises.gif" },
        { name: "D.B Incline Press", target: "3 x 8", sets: 3, reps: 8, img: "db-incline-press.jpg" }
      ]
    },
    "back-abs": {
      name: "Back / Abs", day: "Wed", unlocked: "Weeks 1-2", emoji: "🦍",
      progression: "Add 1-2 reps per set each week until the top of the range (cable crunch 3x15, hanging raise 3x15), then add weight or a harder variation (e.g. straight-leg or toes-to-bar) and reset reps to 12 / 10.",
      exercises: [
        { name: "Neutral Grip Pull ups", target: "3x10", sets: 3, reps: 10, img: "neutral-grip-pullups.jpg" },
        { name: "Lat Pull Downs", target: "3x10", sets: 3, reps: 10, img: "lat-pulldown.gif" },
        { name: "Single Arm Rows", target: "3x12", sets: 3, reps: 12, img: "single-arm-row.gif" },
        { name: "Cable wide Grip Row", target: "3x10", sets: 3, reps: 10, img: "cable-wide-grip-row.gif" },
        { name: "Lat Pushdowns", target: "5 x15", sets: 5, reps: 15, img: "lat-pushdowns.jpg" },
        { name: "Medicine Ball Twist", target: "3x25", sets: 3, reps: 25, img: "med-ball-twist.jpg" },
        { name: "Leg Raises", target: "3x12", sets: 3, reps: 12, img: "leg-raises.gif" },
        { name: "Weighted Cable Crunches", target: "3x12", sets: 3, reps: 12, img: null, ab: true },
        { name: "Hanging Leg Raises", target: "3x10", sets: 3, reps: 10, img: null, ab: true }
      ]
    },
    "legs-arm": {
      name: "Legs / Arm", day: "Fri", unlocked: "Weeks 1-2", emoji: "🦵🏾",
      progression: "Add 1-2 reps per set each week until the top of the range (cable crunch 3x15, hanging raise 3x15), then add weight or a harder variation (e.g. straight-leg or toes-to-bar) and reset reps to 12 / 10.",
      exercises: [
        { name: "Leg Extensions", target: "3x12", sets: 3, reps: 12, img: "leg-extensions.jpg" },
        { name: "Hamstrings Curls", target: "3x12", sets: 3, reps: 12, img: "hamstring-curls.jpg" },
        { name: "Leg Press", target: "3x8", sets: 3, reps: 8, img: "leg-press-a.gif" },
        { name: "Hack Squat", target: "3x10", sets: 3, reps: 10, img: "hack-squat.gif" },
        { name: "Close grip Bench Press", target: "3x10", sets: 3, reps: 10, img: "close-grip-bench.gif" },
        { name: "cable Tricep Extensions", target: "4x15", sets: 4, reps: 15, img: "cable-tricep-ext.gif" },
        { name: "D.B. Incline Curls", target: "4x10", sets: 4, reps: 10, img: "db-incline-curls.gif" },
        { name: "Hammer Curls", target: "till Fail", sets: 3, reps: null, img: "hammer-curls.jpg", note: "Set count not specified on source page (3 set cells in the Notion log)" },
        { name: "Weighted Cable Crunches", target: "3x12", sets: 3, reps: 12, img: null, ab: true },
        { name: "Hanging Leg Raises", target: "3x10", sets: 3, reps: 10, img: null, ab: true }
      ]
    },
    "chest-abs": {
      name: "Chest / Abs", day: "Sat", unlocked: "Weeks 3-4", emoji: "🛬",
      progression: "Add 1-2 reps per set each week until the top of the range (cable crunch 3x15, hanging raise 3x15), then add weight or a harder variation (e.g. straight-leg or toes-to-bar) and reset reps to 12 / 10.",
      exercises: [
        { name: "Peck Deck Fly", target: "3x12", sets: 3, reps: 12, img: "pec-deck-fly.jpg" },
        { name: "Chest Press Machine", target: "3x8", sets: 3, reps: 8, img: "chest-press-machine.gif" },
        { name: "D.B. Incline press", target: "3x10", sets: 3, reps: 10, img: "db-incline-press-b.gif" },
        { name: "Cable High to lows", target: "4x15 Dropset", sets: 4, reps: 15, img: "cable-high-to-low.gif", note: "Dropset" },
        { name: "Push-Ups", target: "3x Fail", sets: 3, reps: null, img: "push-ups.gif", note: "To failure", bodyweight: true },
        { name: "Sit-Ups", target: "3x20", sets: 3, reps: 20, img: "sit-ups.gif", bodyweight: true },
        { name: "CrossBody Sit ups", target: "3x20", sets: 3, reps: 20, img: "crossbody-situps.gif", bodyweight: true },
        { name: "Weighted Cable Crunches", target: "3x12", sets: 3, reps: 12, img: null, ab: true },
        { name: "Hanging Leg Raises", target: "3x10", sets: 3, reps: 10, img: null, ab: true }
      ]
    },
    "back": {
      name: "Back", day: "Thu", unlocked: "Weeks 5-6", emoji: "🏹",
      progression: null,
      exercises: [
        { name: "Smith Machine Bent over Row", target: "3x8", sets: 3, reps: 8, img: "smith-bent-row.gif" },
        { name: "Incline Chest Supported Rows", target: "3x10", sets: 3, reps: 10, img: "chest-supported-row.gif" },
        { name: "Cable Seated Row", target: "3x10", sets: 3, reps: 10, img: "cable-seated-row.jpg" },
        { name: "Single Arm Cable lat Pull down", target: "3x12", sets: 3, reps: 12, img: "single-arm-cable-pulldown.gif" },
        { name: "Pec Deck Rear Delt Fly", target: "4x15", sets: 4, reps: 15, img: "rear-delt-fly.gif" }
      ]
    },
    "legs-arms": {
      name: "Legs / Arms", day: "TBD (app: Tue)", unlocked: "Week 7+", emoji: "🔥",
      progression: null,
      exercises: [
        { name: "Squats", target: "3x8", sets: 3, reps: 8, img: "squats.gif" },
        { name: "Leg Press", target: "3x10", sets: 3, reps: 10, img: "leg-press-b.gif" },
        { name: "Hack Squat", target: "3x12", sets: 3, reps: 12, img: "hack-squat-b.gif" },
        { name: "RDLs", target: "3x12", sets: 3, reps: 12, img: "rdl.gif" },
        { name: "Standing Calf Raises", target: "3x20", sets: 3, reps: 20, img: "calf-raises.gif" },
        { name: "Rope Cable Curls", target: "3x15", sets: 3, reps: 15, img: "rope-cable-curls.gif" },
        { name: "Tricep Ext", target: "3x15", sets: 3, reps: 15, img: "tricep-ext.gif" }
      ]
    }
  },
  meals: {
    B:  { code: "B",  name: "Egg & parfait box", tag: "daily", what: "3 hard-boiled eggs + 1 Oikos nonfat cup + 45 g PB granola + 150 g strawberries + black coffee", kcal: 566, protein: 40, fat: 24, carbs: 48, sodium: 370 },
    L1: { code: "L1", name: "Chicken rice bowl", what: "150 g grilled chicken (cooked) + 150 g white rice + 50 g bell pepper + 25 g onion, garlic powder/paprika", kcal: 468, protein: 51, fat: 6, carbs: 48, sodium: 115 },
    L2: { code: "L2", name: "Beef rice bowl", what: "200 g 93% lean beef (raw wt) + 150 g white rice + 50 g bell pepper + 25 g onion", kcal: 525, protein: 47, fat: 15, carbs: 48, sodium: 135 },
    S:  { code: "S",  name: "Potato + shake", tag: "daily, pre-gym", what: "200 g baked potato cubes (paprika/garlic) + 1 scoop Jocko cookies & cream shaken with water + 200 g watermelon", kcal: 376, protein: 31, fat: 3, carbs: 61, sodium: 170 },
    D1: { code: "D1", name: "Beef & rice", tag: "your usual", what: "225 g 93% beef (raw wt) + 125 g white rice + 100 g pineapple. Swap option: beef & potato hash pan (use 175 g potato instead of the rice, about the same kcal)", kcal: 555, protein: 51, fat: 16, carbs: 48, sodium: 150 },
    D2: { code: "D2", name: "Pineapple chicken pan", what: "170 g chicken (cooked) + 100 g pineapple + 75 g bell pepper + 40 g onion + 1 tsp low-sodium soy, over 125 g white rice", kcal: 535, protein: 58, fat: 7, carbs: 57, sodium: 325 },
    D3: { code: "D3", name: "Chicken & potato pan", what: "170 g chicken (cooked) + 200 g potato + 50 g bell pepper + 40 g onion, cooking spray, paprika/garlic", kcal: 498, protein: 59, fat: 7, carbs: 49, sodium: 150 }
  },
  mealSlots: [
    { key: "breakfast", label: "Breakfast", time: "5:30–7 AM, car/desk" },
    { key: "lunch", label: "Lunch", time: "≈12 PM, then walk" },
    { key: "snack", label: "Pre-gym snack", time: "≈4:30 PM; ≈3:30 PM on rest days" },
    { key: "dinner", label: "Dinner", time: "" }
  ],
  // index 0 = Sun ... 6 = Sat
  week: [
    { day: "Sun", tag: "🍳 Prep day", breakfast: ["B", "eat at home"], lunch: ["L1", "from the prep batch"], snack: ["S", ""], dinner: ["D1", "fresh from prep"], total: "1,964 kcal · 173 g P · 49 g F · 205 g C · ≈810 mg Na" },
    { day: "Mon", tag: "🏋️ Chest/Shoulders", breakfast: ["B", ""], lunch: ["L1", ""], snack: ["S", ""], dinner: ["D1", "reheat ≈8:30 PM"], total: "1,964 kcal · 173 g P · 49 g F · 205 g C · ≈810 mg Na" },
    { day: "Tue", tag: "", breakfast: ["B", ""], lunch: ["L2", ""], snack: ["S", ""], dinner: ["D2", "reheat (then mini-cook)"], total: "2,002 kcal · 176 g P · 48 g F · 214 g C · ≈1,000 mg Na" },
    { day: "Wed", tag: "🏋️ Back/Abs", breakfast: ["B", ""], lunch: ["L2", ""], snack: ["S", ""], dinner: ["D3", "reheat ≈8:30 PM"], total: "1,964 kcal · 176 g P · 48 g F · 206 g C · ≈830 mg Na" },
    { day: "Thu", tag: "", breakfast: ["B", ""], lunch: ["L1", ""], snack: ["S", ""], dinner: ["D1", "or hash swap, reheat"], total: "1,964 kcal · 173 g P · 49 g F · 205 g C · ≈810 mg Na" },
    { day: "Fri", tag: "🏋️ Legs/Arm", breakfast: ["B", ""], lunch: ["L2", ""], snack: ["S", ""], dinner: ["D2", "reheat ≈8:30 PM"], total: "2,002 kcal · 176 g P · 48 g F · 214 g C · ≈1,000 mg Na" },
    { day: "Sat", tag: "", breakfast: ["B", "eat at home"], lunch: ["L2", "cooked fresh"], snack: ["S", ""], dinner: ["D3", "cooked fresh"], total: "1,964 kcal · 176 g P · 48 g F · 206 g C · ≈830 mg Na" }
  ],
  mealsHow: "Every meal uses only foods you already eat. Breakfast and the afternoon snack are the same every day. Beef dinner night → chicken lunch; chicken dinner night → beef lunch. Chicken weighed cooked. Beef weighed raw. Potato and rice weighed cooked. Pack everything in an insulated bag with an ice pack.",
  weeklyAvg: "≈1,975 kcal · 175 g protein · 48 g fat · 208 g carbs · ≈870 mg sodium before added salt. Keep added salt ≤ ¼ tsp/day total (≈575 mg) and 1 tsp low-sodium soy per pineapple pan serving. Any D1/D2/D3 can trade nights — keep \"beef dinner → chicken lunch, chicken dinner → beef lunch\".",
  groceries: [
    { cat: "Protein", items: [
      ["Boneless skinless chicken breast", "≈3.5 lb raw", "≈1.5 kg raw → ≈1,130 g cooked"],
      ["93% lean ground beef", "3.5 lb", "≈1,475 g used. e.g. 4 × 1-lb packs, leftover ½ lb frozen"],
      ["Jocko cookies & cream protein", "7 scoops", "≈220 g; check the tub"] ] },
    { cat: "Dairy / eggs", items: [
      ["Eggs", "2 dozen", "21 used: 12 boiled Sun, 9 boiled Tue"],
      ["Oikos nonfat Greek yogurt", "7 single cups", "≈5.3 oz each"] ] },
    { cat: "Carbs", items: [
      ["White rice", "≈1.25 lb dry", "≈3 cups dry → ≈1,675 g cooked"],
      ["Russet potatoes", "≈5 lb", "8–10 medium → ≈1,800 g baked/roasted"],
      ["Peanut butter granola", "1 bag (≥11 oz)", "315 g used, 45 g/day"] ] },
    { cat: "Fruit", items: [
      ["Strawberries", "≈2.5 lb", "1,050 g used, 150 g/day"],
      ["Watermelon", "1 small seedless (≈5 lb) or ≈3 lb pre-cut", "1,400 g flesh, 200 g/day"],
      ["Pineapple", "1 medium or ≈1.25 lb pre-cut", "500 g used"] ] },
    { cat: "Produce", items: [
      ["Bell peppers (red/mixed)", "4–5 large", "≈600 g used"],
      ["Yellow onions", "2 medium", "≈335 g used"] ] },
    { cat: "Pantry", note: "check stock, restock as needed", items: [
      ["Black coffee", "", ""],
      ["Low-sodium soy sauce", "", "≈2 tsp/week"],
      ["Garlic powder", "", ""],
      ["Paprika", "", ""],
      ["Cooking spray", "", ""],
      ["Meal-prep containers (≈20) + small bags for granola + ice packs/insulated lunch bag", "", ""] ] }
  ],
  cookSummary: "Sunday main prep covers Sun–Wed. A Tuesday evening mini-cook covers Thu–Fri. Saturday is a light fresh cook. Reheat-only days: Mon, Wed, Thu, Fri. On Mon/Wed/Fri you get home after 8 PM, so dinner is a 2–3 min microwave reheat and nothing gets cooked. Cooked meat and rice are used within 4 days (fridge ≤ 40°F).",
  cook: [
    { id: "sun", dow: 0, title: "Sunday main prep", dur: "≈2–2¼ hr, e.g. 2:00–4:15 PM", steps: [
      ["0:00", "Preheat oven to 425°F. Start the rice cooker with 1¾ cups dry rice (≈975 g cooked). Boil 12 eggs (12 min, then an ice bath)."],
      ["0:10", "Scrub and cube ≈2.75 lb potatoes, then toss with spray, paprika and garlic powder. Sheet pan 1 goes in for 35–40 min (≈1,000 g cooked: 4 snacks + Wed dinner)."],
      ["0:15", "Season ≈1.9 lb raw chicken (garlic powder and paprika). Sheet pan 2 goes in for 20–25 min to 165°F internal. Put the Tue pineapple chicken portion on a corner of the pan with pineapple, pepper and onion, plus 1 tsp low-sodium soy after it comes out."],
      ["0:20", "Brown ≈1.9 lb (850 g raw) beef in a skillet with garlic powder and paprika (12–15 min). Drain."],
      ["0:40", "Chop peppers and onion for 4 lunches + the Wed pan. Sauté them in the beef pan or roast them alongside."],
      ["1:00", "Cube watermelon, rinse strawberries, peel eggs."],
      ["1:15–2:00", "Weigh and portion: lunches Mon–Wed (Mon L1, Tue L2, Wed L2), dinners Mon (D1), Tue (D2), Wed (D3 with 200 g of the potatoes), and snack boxes Sun–Wed. Build breakfast kits: 3 eggs + Oikos cup + 45 g granola bag + 150 g strawberries. Eat Sun lunch (L1) and dinner (D1) from the batch."],
      ["2:00", "Clean up and stack the fridge by day."] ] },
    { id: "tue", dow: 2, title: "Tuesday evening mini-cook", dur: "≈40–45 min, ≈7:15–8:00 PM after the commute home", steps: [
      ["0:00", "Preheat oven to 425°F. Rice cooker gets 1¼ cups dry rice (≈700 g cooked for Thu, Fri and Sat lunch). Boil 9 eggs."],
      ["0:05", "Cube ≈1.6 lb potatoes (600 g cooked = Thu–Sat snacks). Sheet pan goes in for 35 min."],
      ["0:10", "≈1 lb raw chicken goes on a second pan (Thu lunch plain + the Fri pineapple-chicken portion with pineapple, pepper and onion), 20–25 min."],
      ["0:15", "Brown ≈1 lb (425 g raw) beef (Thu dinner + Fri lunch). Eat your reheated Tue dinner while the oven runs."],
      ["0:35–0:45", "Portion Thu L1/D1, Fri L2/D2, snack boxes Thu–Sat, and breakfast kits Thu–Sat."] ] },
    { id: "sat", dow: 6, title: "Saturday light cook", dur: "≈35 min, mostly hands-off, ≈12:00 PM", steps: [
      ["", "Brown 200 g beef for lunch (10 min) over the prepped rice."],
      ["", "Bake the D3 chicken & potato pan for dinner (≈0.5 lb raw chicken + 200 g potato + pepper/onion, 425°F for 30–35 min)."],
      ["", "Use this time to write next week's grocery order."] ] }
  ],
  rhythm: "Grab the breakfast kit and lunch/snack bag with an ice pack at ≈5:15 AM. Eat breakfast at a stop or your desk before 9. Lunch at noon, then the walk. Eat the snack ≈4:30 PM before leaving Oceanside at 5 (it's your pre-workout on Mon/Wed/Fri). Gym-night dinner is ready to reheat as soon as you're home."
};
