// ============================================================================
// TKBSO ESTIMAITE - MASTER PRICING TABLE v2.0
// ============================================================================
// 
// RULES FOR THIS TABLE:
// 1. Every item has a unique, clear name
// 2. Names match what users actually say
// 3. No duplicate concepts with different names
// 4. Each item has: cost, price, unit, and whether quantity multiplies
// 5. Categories match the conversation flow
//
// USAGE:
// - The AI extracts user intent and maps to these EXACT item names
// - The line item generator uses these names directly
// - The PDF displays these names as-is
//
// ============================================================================

export interface PricingItem {
  cost: number;
  price: number;
  unit: string;
  perUnit: boolean;  // true = multiply by quantity, false = flat rate
  category: string;
  aliases: string[]; // Other ways users might say this
}

export const PRICING_TABLE: Record<string, PricingItem> = {

  // ============================================================================
  // DEMOLITION & SITE PREP
  // ============================================================================

  // --- Site Protection ---
  "Floor Protection": {
    cost: 0.50, price: 1.00, unit: "sqft", perUnit: true,
    category: "demo",
    aliases: ["ramboard", "floor covering", "protect floors"]
  },
  "Dust Barrier Setup": {
    cost: 150, price: 300, unit: "ea", perUnit: true,
    category: "demo",
    aliases: ["zipwall", "plastic barrier", "dust wall"]
  },
  "Air Scrubber Rental": {
    cost: 200, price: 350, unit: "week", perUnit: true,
    category: "demo",
    aliases: ["hepa filter", "air filtration"]
  },
  "Furniture Moving": {
    cost: 45, price: 85, unit: "hour", perUnit: true,
    category: "demo",
    aliases: ["move furniture", "content moving"]
  },

  // --- Bathroom Demo ---
  "Demo - Half Bath": {
    cost: 800, price: 1200, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["gut half bath", "demo powder room"]
  },
  "Demo - Full Bath": {
    cost: 1360, price: 2267, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["gut bathroom", "demo full bath", "bathroom gut"]
  },
  "Demo - Large Bathroom": {
    cost: 1650, price: 4500, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["gut master bath", "demo large bath", "major demo"]
  },
  "Demo - Vanity": {
    cost: 150, price: 250, unit: "ea", perUnit: true,
    category: "demo",
    aliases: ["remove vanity", "vanity removal", "take out vanity", "demo vanities"]
  },
  "Demo - Toilet": {
    cost: 75, price: 125, unit: "ea", perUnit: true,
    category: "demo",
    aliases: ["remove toilet", "toilet removal"]
  },
  "Demo - Shower": {
    cost: 400, price: 667, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["remove shower", "shower removal", "gut shower"]
  },
  "Demo - Tub": {
    cost: 300, price: 500, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["remove tub", "tub removal", "take out tub"]
  },
  "Demo - Tub/Shower Combo": {
    cost: 500, price: 833, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["remove tub shower", "gut tub shower"]
  },

  // --- Kitchen Demo ---
  "Demo - Full Kitchen": {
    cost: 1360, price: 1500, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["gut kitchen", "kitchen gut", "demo kitchen"]
  },
  "Demo - Cabinets Only": {
    cost: 600, price: 1000, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["remove cabinets", "cabinet removal"]
  },
  "Demo - Countertops Only": {
    cost: 300, price: 500, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["remove countertops", "countertop removal"]
  },
  "Demo - Backsplash": {
    cost: 200, price: 333, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["remove backsplash", "backsplash removal"]
  },

  // --- Heavy/Difficult Demo ---
  "Demo - Soffits": {
    cost: 15, price: 30, unit: "ea", perUnit: true,
    category: "demo",
    aliases: ["remove soffits", "soffit removal", "take down soffits"]
  },
  "Demo - Tile (Mud-Set)": {
    cost: 6, price: 12, unit: "sqft", perUnit: true,
    category: "demo",
    aliases: ["mud set tile removal", "concrete bed tile"]
  },
  "Demo - Cast Iron Tub": {
    cost: 250, price: 500, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["cast iron removal", "smash tub"]
  },
  "Demo - Glued Flooring": {
    cost: 4, price: 8, unit: "sqft", perUnit: true,
    category: "demo",
    aliases: ["glued down removal", "adhesive flooring removal"]
  },
  "Demo - Popcorn Ceiling": {
    cost: 3.50, price: 7, unit: "sqft", perUnit: true,
    category: "demo",
    aliases: ["scrape popcorn", "popcorn removal"]
  },

  // --- Disposal ---
  "Dumpster - 20 Yard": {
    cost: 550, price: 750, unit: "ea", perUnit: true,
    category: "demo",
    aliases: ["dumpster", "20 yard dumpster"]
  },
  "Haul Away": {
    cost: 400, price: 700, unit: "load", perUnit: true,
    category: "demo",
    aliases: ["debris removal", "truck haul", "haul off"]
  },
  "Difficult Access Fee": {
    cost: 300, price: 600, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["stair carry", "no elevator", "difficult access"]
  },

  // --- Cleaning ---
  "Post-Construction Clean": {
    cost: 350, price: 583, unit: "ea", perUnit: false,
    category: "demo",
    aliases: ["final clean", "construction cleanup"]
  },
  "Daily Cleanup": {
    cost: 75, price: 125, unit: "day", perUnit: true,
    category: "demo",
    aliases: ["daily clean", "jobsite cleanup"]
  },


  // ============================================================================
  // STRUCTURAL & FRAMING
  // ============================================================================

  "Framing - Standard": {
    cost: 550, price: 917, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["framing", "frame wall", "new framing"]
  },
  "Framing - Pony Wall": {
    cost: 400, price: 667, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["half wall", "knee wall", "pony wall"]
  },
  "Framing - Pocket Door": {
    cost: 1200, price: 1875, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["pocket door frame", "pocket door install"]
  },
  "Framing - New Doorway": {
    cost: 550, price: 917, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["new door opening", "frame doorway", "add doorway"]
  },
  "Framing - Door Closure": {
    cost: 500, price: 833, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["close doorway", "frame in door", "remove door"]
  },
  "Shower Niche": {
    cost: 300, price: 500, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["niche", "shower shelf", "recessed shelf"]
  },
  "Shower Bench": {
    cost: 400, price: 667, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["bench", "shower seat", "built-in bench"]
  },

  // --- Structural/Complex ---
  "Wall Removal": {
    cost: 2100, price: 3500, unit: "ea", perUnit: false,
    category: "framing",
    aliases: ["remove wall", "take down wall", "open up wall"]
  },
  "Door Relocation": {
    cost: 1000, price: 1667, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["move door", "relocate door"]
  },
  "Shower Enlargement": {
    cost: 2000, price: 3333, unit: "ea", perUnit: false,
    category: "framing",
    aliases: ["bigger shower", "expand shower", "enlarge shower"]
  },
  "Closet Buildout": {
    cost: 1750, price: 3500, unit: "ea", perUnit: true,
    category: "framing",
    aliases: ["build closet", "closet framing", "new closet"]
  },

  // --- Hidden Structural ---
  "Load-Bearing Beam Install": {
    cost: 2500, price: 4500, unit: "ea", perUnit: false,
    category: "framing",
    aliases: ["beam install", "header", "load bearing"]
  },
  "Foundation Repair": {
    cost: 3000, price: 5500, unit: "ea", perUnit: false,
    category: "framing",
    aliases: ["slab repair", "foundation work"]
  },
  "Engineering Drawings": {
    cost: 800, price: 1500, unit: "ea", perUnit: false,
    category: "framing",
    aliases: ["engineer stamp", "structural drawings"]
  },


  // ============================================================================
  // PLUMBING
  // ============================================================================

  // --- Bathroom Plumbing (Rough-In / Labor) ---
  "Plumbing - Shower Rough-In": {
    cost: 1800, price: 3000, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["shower plumbing", "shower rough", "new shower plumbing"]
  },
  "Plumbing - Shower Valve Extra": {
    cost: 500, price: 833, unit: "ea", perUnit: true,
    category: "plumbing",
    aliases: ["extra shower head", "diverter", "second shower head"]
  },
  "Plumbing - Tub to Shower Conversion": {
    cost: 2500, price: 5500, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["convert tub to shower", "tub to shower"]
  },
  "Plumbing - Freestanding Tub": {
    cost: 1250, price: 2500, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["freestanding tub plumbing", "soaker tub install"]
  },
  "Plumbing - Toilet": {
    cost: 250, price: 417, unit: "ea", perUnit: true,
    category: "plumbing",
    aliases: ["toilet install", "set toilet", "toilet plumbing"]
  },
  "Plumbing - Toilet Relocation": {
    cost: 4000, price: 6667, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["move toilet", "relocate toilet"]
  },
  "Plumbing - Vanity Connection": {
    cost: 350, price: 583, unit: "ea", perUnit: true,
    category: "plumbing",
    aliases: ["vanity plumbing", "sink hookup", "connect vanity", "vanity hookup"]
  },
  "Plumbing - Linear Drain": {
    cost: 750, price: 1250, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["linear drain", "trench drain", "slot drain"]
  },
  "Plumbing - Tub Drain Relocation": {
    cost: 1800, price: 3000, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["move tub drain", "relocate tub drain"]
  },
  "Plumbing - Shower Drain Relocation": {
    cost: 1335, price: 2225, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["move shower drain", "relocate shower drain"]
  },
  "Plumbing - Cap Off": {
    cost: 150, price: 250, unit: "ea", perUnit: true,
    category: "plumbing",
    aliases: ["cap off plumbing", "cap line", "abandon line"]
  },

  // --- Kitchen Plumbing ---
  "Plumbing - Kitchen Sink": {
    cost: 400, price: 667, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["kitchen sink plumbing", "kitchen hookup"]
  },
  "Plumbing - Dishwasher": {
    cost: 200, price: 333, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["dishwasher hookup", "dishwasher connection"]
  },
  "Plumbing - Ice Maker Line": {
    cost: 150, price: 250, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["ice maker", "fridge water line"]
  },
  "Plumbing - Pot Filler": {
    cost: 550, price: 950, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["pot filler", "stove faucet"]
  },

  // --- Specialty Plumbing ---
  "Plumbing - Steam Generator": {
    cost: 1200, price: 2200, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["steam shower", "steam generator"]
  },
  "Plumbing - Tankless Water Heater": {
    cost: 1800, price: 3200, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["tankless install", "on-demand water heater"]
  },
  "Plumbing - Recirculation Pump": {
    cost: 450, price: 850, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["recirc pump", "hot water recirculation"]
  },

  // --- Gas ---
  "Gas Line - New Run": {
    cost: 800, price: 1500, unit: "ea", perUnit: false,
    category: "plumbing",
    aliases: ["new gas line", "gas rough-in"]
  },
  "Gas Line - Per Foot": {
    cost: 18, price: 32, unit: "LF", perUnit: true,
    category: "plumbing",
    aliases: ["gas pipe", "gas line extension"]
  },


  // ============================================================================
  // ELECTRICAL
  // ============================================================================

  // --- Standard Electrical ---
  "Electrical - Recessed Light": {
    cost: 65, price: 108, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["can light", "recessed can", "pot light", "recessed lighting"]
  },
  "Electrical - Vanity Light": {
    cost: 225, price: 375, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["vanity light", "bathroom light", "bar light", "vanity fixture"]
  },
  "Electrical - Outlet": {
    cost: 35, price: 65, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["outlet", "receptacle", "plug"]
  },
  "Electrical - GFCI Outlet": {
    cost: 45, price: 85, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["gfci", "gfi outlet", "bathroom outlet"]
  },
  "Electrical - Switch": {
    cost: 30, price: 55, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["light switch", "switch"]
  },
  "Electrical - Dimmer": {
    cost: 45, price: 85, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["dimmer", "dimmer switch"]
  },
  "Electrical - New Circuit": {
    cost: 250, price: 450, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["new line", "new circuit", "dedicated line"]
  },
  "Electrical - Dedicated Circuit": {
    cost: 175, price: 325, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["dedicated circuit", "appliance circuit"]
  },

  // --- Packages ---
  "Electrical - Small Bathroom Package": {
    cost: 850, price: 1417, unit: "ea", perUnit: false,
    category: "electrical",
    aliases: ["bathroom electrical", "small electrical package"]
  },
  "Electrical - Kitchen Package": {
    cost: 1500, price: 2500, unit: "ea", perUnit: false,
    category: "electrical",
    aliases: ["kitchen electrical", "kitchen electrical package"]
  },

  // --- Upgrades ---
  "Electrical - Panel Upgrade 200A": {
    cost: 2500, price: 3800, unit: "ea", perUnit: false,
    category: "electrical",
    aliases: ["panel upgrade", "200 amp panel", "electrical panel"]
  },
  "Electrical - 240V Circuit": {
    cost: 450, price: 850, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["240 volt", "220 circuit", "dryer circuit"]
  },
  "Electrical - Under Cabinet LED": {
    cost: 400, price: 750, unit: "run", perUnit: true,
    category: "electrical",
    aliases: ["under cabinet lighting", "cabinet lights"]
  },
  "Electrical - Heated Floor": {
    cost: 18, price: 32, unit: "sqft", perUnit: true,
    category: "electrical",
    aliases: ["heated floor", "floor heat", "radiant floor"]
  },
  "Electrical - Exhaust Fan": {
    cost: 250, price: 450, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["vent fan", "bathroom fan", "exhaust fan"]
  },
  "Electrical - Fan/Light Combo": {
    cost: 350, price: 650, unit: "ea", perUnit: true,
    category: "electrical",
    aliases: ["fan light combo", "bathroom fan light"]
  },


  // ============================================================================
  // TILE & WATERPROOFING
  // ============================================================================

  // --- Tile Labor ---
  "Tile - Wall": {
    cost: 18, price: 30, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["wall tile", "shower wall tile", "bathroom wall tile"]
  },
  "Tile - Shower Floor": {
    cost: 16.50, price: 27.50, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["shower floor tile", "shower pan tile"]
  },
  "Tile - Main Floor": {
    cost: 11.50, price: 19.17, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["floor tile", "bathroom floor", "main floor tile"]
  },
  "Tile - Tub Surround": {
    cost: 18, price: 30, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["tub surround", "tub tile", "tub wall tile"]
  },
  "Tile - Backsplash": {
    cost: 18, price: 32, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["backsplash", "kitchen backsplash"]
  },

  // --- Tile Specialty ---
  "Tile - Herringbone Pattern": {
    cost: 8, price: 15, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["herringbone", "herringbone pattern"]
  },
  "Tile - Large Format": {
    cost: 6, price: 12, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["large format", "big tile", "24x24", "24x48"]
  },
  "Tile - Mosaic": {
    cost: 28, price: 52, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["mosaic", "penny tile", "small tile"]
  },
  "Tile - Accent Band": {
    cost: 18, price: 35, unit: "LF", perUnit: true,
    category: "tile",
    aliases: ["accent tile", "tile border", "decorative band"]
  },
  "Schluter Trim": {
    cost: 15, price: 28, unit: "LF", perUnit: true,
    category: "tile",
    aliases: ["schluter", "metal edge", "tile edge trim"]
  },

  // --- Waterproofing & Substrate ---
  "Waterproofing": {
    cost: 3.60, price: 6, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["waterproof", "kerdi", "redgard", "shower waterproofing"]
  },
  "Cement Board": {
    cost: 3, price: 5, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["backer board", "cement board", "durock", "hardiebacker"]
  },
  "Floor Leveling": {
    cost: 500, price: 833, unit: "ea", perUnit: false,
    category: "tile",
    aliases: ["level floor", "self leveling", "floor prep"]
  },
  "Shower Curb": {
    cost: 200, price: 333, unit: "ea", perUnit: false,
    category: "tile",
    aliases: ["curb", "shower curb", "threshold"]
  },

  // --- Flooring (Non-Tile) ---
  "Flooring - LVP": {
    cost: 4.50, price: 7.50, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["lvp", "vinyl plank", "luxury vinyl"]
  },
  "Flooring - Laminate": {
    cost: 4.25, price: 7.08, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["laminate", "laminate flooring"]
  },
  "Flooring - Hardwood": {
    cost: 6, price: 10, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["hardwood", "wood floor"]
  },
  "Flooring - Hardwood Refinish": {
    cost: 3.50, price: 6, unit: "sqft", perUnit: true,
    category: "tile",
    aliases: ["refinish floors", "sand and stain"]
  },


  // ============================================================================
  // CABINETRY & VANITIES
  // ============================================================================

  // --- Vanities (Bundle: Cabinet + Top + Sink) ---
  "Vanity - 24in": {
    cost: 900, price: 1500, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["24 inch vanity", "24\" vanity", "small vanity"]
  },
  "Vanity - 30in": {
    cost: 1100, price: 1833, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["30 inch vanity", "30\" vanity"]
  },
  "Vanity - 36in": {
    cost: 1300, price: 2167, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["36 inch vanity", "36\" vanity"]
  },
  "Vanity - 48in": {
    cost: 2500, price: 4167, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["48 inch vanity", "48\" vanity"]
  },
  "Vanity - 60in": {
    cost: 2200, price: 3667, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["60 inch vanity", "60\" vanity", "5 foot vanity", "double vanity"]
  },
  "Vanity - 72in": {
    cost: 2600, price: 4333, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["72 inch vanity", "72\" vanity", "6 foot vanity"]
  },
  "Vanity - 84in": {
    cost: 3200, price: 5333, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["84 inch vanity", "84\" vanity", "7 foot vanity"]
  },
  "Vanity - 96in": {
    cost: 3800, price: 6333, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["96 inch vanity", "96\" vanity", "8 foot vanity"]
  },
  "Vanity - 120in": {
    cost: 4200, price: 7000, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["120 inch vanity", "120\" vanity", "10 foot vanity"]
  },
  "Vanity - 144in": {
    cost: 4500, price: 7500, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["144 inch vanity", "144\" vanity", "12 foot vanity"]
  },

  // --- Kitchen Cabinets ---
  "Cabinet - Per Box": {
    cost: 150, price: 250, unit: "box", perUnit: true,
    category: "cabinetry",
    aliases: ["cabinet box", "cabinet"]
  },
  "Cabinet Install Labor": {
    cost: 50, price: 83, unit: "box", perUnit: true,
    category: "cabinetry",
    aliases: ["cabinet installation", "hang cabinets"]
  },

  // --- Cabinet Add-Ons ---
  "Soft-Close Hinges": {
    cost: 8, price: 15, unit: "door", perUnit: true,
    category: "cabinetry",
    aliases: ["soft close", "soft close upgrade"]
  },
  "Pull-Out Trash": {
    cost: 180, price: 340, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["trash pullout", "garbage pullout"]
  },
  "Lazy Susan": {
    cost: 250, price: 450, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["lazy susan", "corner cabinet spinner"]
  },

  // --- Closet ---
  "Closet Shelving": {
    cost: 400, price: 750, unit: "closet", perUnit: true,
    category: "cabinetry",
    aliases: ["closet shelves", "wire shelving", "closet organizer"]
  },
  "Closet Cabinetry": {
    cost: 2000, price: 3500, unit: "ea", perUnit: true,
    category: "cabinetry",
    aliases: ["closet cabinets", "built-in closet", "custom closet"]
  },


  // ============================================================================
  // COUNTERTOPS
  // ============================================================================

  // --- Countertop Materials + Fabrication ---
  "Countertop - Laminate": {
    cost: 25, price: 42, unit: "sqft", perUnit: true,
    category: "countertops",
    aliases: ["laminate countertop", "formica"]
  },
  "Countertop - Quartz Level 1": {
    cost: 45, price: 75, unit: "sqft", perUnit: true,
    category: "countertops",
    aliases: ["quartz", "quartz countertop", "level 1 quartz", "basic quartz"]
  },
  "Countertop - Quartz Level 2": {
    cost: 55, price: 92, unit: "sqft", perUnit: true,
    category: "countertops",
    aliases: ["level 2 quartz", "mid-grade quartz"]
  },
  "Countertop - Quartz Level 3": {
    cost: 70, price: 117, unit: "sqft", perUnit: true,
    category: "countertops",
    aliases: ["level 3 quartz", "premium quartz"]
  },
  "Countertop - Granite": {
    cost: 50, price: 83, unit: "sqft", perUnit: true,
    category: "countertops",
    aliases: ["granite", "granite countertop"]
  },
  "Countertop - Quartzite": {
    cost: 75, price: 125, unit: "sqft", perUnit: true,
    category: "countertops",
    aliases: ["quartzite", "quartzite countertop"]
  },
  "Countertop - Marble": {
    cost: 80, price: 133, unit: "sqft", perUnit: true,
    category: "countertops",
    aliases: ["marble", "marble countertop"]
  },

  // --- Countertop Add-Ons ---
  "Sink Cutout - Undermount": {
    cost: 150, price: 280, unit: "ea", perUnit: true,
    category: "countertops",
    aliases: ["undermount cutout", "sink cutout", "undermount sink"]
  },
  "Sink Cutout - Drop-In": {
    cost: 75, price: 140, unit: "ea", perUnit: true,
    category: "countertops",
    aliases: ["drop in cutout", "drop in sink"]
  },
  "Cooktop Cutout": {
    cost: 200, price: 380, unit: "ea", perUnit: true,
    category: "countertops",
    aliases: ["cooktop cutout", "range cutout"]
  },
  "Faucet Hole": {
    cost: 40, price: 75, unit: "ea", perUnit: true,
    category: "countertops",
    aliases: ["faucet hole", "faucet drilling"]
  },
  "Waterfall Edge": {
    cost: 650, price: 1200, unit: "ea", perUnit: false,
    category: "countertops",
    aliases: ["waterfall", "waterfall edge", "waterfall countertop"]
  },
  "Full Height Backsplash": {
    cost: 450, price: 850, unit: "ea", perUnit: false,
    category: "countertops",
    aliases: ["full backsplash", "slab backsplash"]
  },


  // ============================================================================
  // FIXTURES & ALLOWANCES
  // ============================================================================

  // --- Bathroom Fixtures ---
  "Toilet": {
    cost: 210, price: 350, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["toilet", "commode", "new toilet"]
  },
  "Faucet - Bathroom": {
    cost: 99, price: 165, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["faucet", "bathroom faucet", "sink faucet", "faucets"]
  },
  "Faucet - Kitchen": {
    cost: 159, price: 265, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["kitchen faucet"]
  },
  "Shower Trim Kit": {
    cost: 180, price: 300, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["shower trim", "shower valve trim", "shower kit"]
  },
  "Tub Filler": {
    cost: 300, price: 500, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["tub filler", "tub faucet", "tub spout"]
  },
  "Tub - Standard": {
    cost: 300, price: 500, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["tub", "bathtub", "alcove tub"]
  },
  "Tub - Freestanding": {
    cost: 720, price: 1200, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["freestanding tub", "soaker tub", "standalone tub"]
  },
  "Mirror - Standard": {
    cost: 150, price: 250, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["mirror", "bathroom mirror", "vanity mirror"]
  },
  "Mirror - LED": {
    cost: 210, price: 350, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["led mirror", "lighted mirror", "backlit mirror"]
  },
  "Medicine Cabinet": {
    cost: 200, price: 380, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["medicine cabinet", "recessed cabinet"]
  },

  // --- Kitchen Fixtures ---
  "Kitchen Sink": {
    cost: 270, price: 450, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["kitchen sink", "farmhouse sink"]
  },
  "Garbage Disposal": {
    cost: 84, price: 140, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["disposal", "garbage disposal", "disposer"]
  },
  "Garbage Disposal Install": {
    cost: 150, price: 250, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["install disposal", "disposal installation"]
  },

  // --- Accessories ---
  "Towel Bar": {
    cost: 40, price: 75, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["towel bar", "towel rack"]
  },
  "Toilet Paper Holder": {
    cost: 25, price: 45, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["tp holder", "toilet paper holder"]
  },
  "Robe Hook": {
    cost: 20, price: 35, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["robe hook", "towel hook"]
  },
  "Grab Bar": {
    cost: 120, price: 220, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["grab bar", "safety bar", "ada bar"]
  },
  "Shower Rod - Standard": {
    cost: 45, price: 85, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["shower rod", "curtain rod"]
  },
  "Shower Rod - Curved": {
    cost: 85, price: 160, unit: "ea", perUnit: true,
    category: "fixtures",
    aliases: ["curved rod", "curved shower rod"]
  },


  // ============================================================================
  // GLASS
  // ============================================================================

  "Glass - Door Only": {
    cost: 650, price: 1083, unit: "ea", perUnit: false,
    category: "glass",
    aliases: ["shower door", "glass door"]
  },
  "Glass - Panel Only": {
    cost: 800, price: 1333, unit: "ea", perUnit: false,
    category: "glass",
    aliases: ["glass panel", "fixed panel", "shower panel"]
  },
  "Glass - Door + Panel": {
    cost: 1350, price: 2250, unit: "ea", perUnit: false,
    category: "glass",
    aliases: ["door and panel", "shower enclosure", "glass enclosure"]
  },
  "Glass - 90 Degree Return": {
    cost: 1425, price: 2375, unit: "ea", perUnit: false,
    category: "glass",
    aliases: ["90 degree", "corner shower", "neo angle"]
  },
  "Glass - Full Enclosure": {
    cost: 1800, price: 3000, unit: "ea", perUnit: false,
    category: "glass",
    aliases: ["full enclosure", "3 panel shower", "frameless enclosure"]
  },


  // ============================================================================
  // PAINT & DRYWALL
  // ============================================================================

  "Paint - Half Bath": {
    cost: 400, price: 667, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["paint half bath", "powder room paint"]
  },
  "Paint - Full Bath": {
    cost: 600, price: 1000, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["paint bathroom", "bathroom paint", "paint full bath"]
  },
  "Paint - Large Bath": {
    cost: 900, price: 1500, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["paint master bath", "large bathroom paint"]
  },
  "Paint - Kitchen": {
    cost: 1200, price: 2000, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["paint kitchen", "kitchen paint"]
  },
  "Paint - Per Sqft": {
    cost: 1.50, price: 2.75, unit: "sqft", perUnit: true,
    category: "paint",
    aliases: ["paint walls", "wall paint"]
  },
  "Paint - Ceiling": {
    cost: 250, price: 450, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["paint ceiling", "ceiling paint"]
  },
  "Paint - Door": {
    cost: 75, price: 135, unit: "ea", perUnit: true,
    category: "paint",
    aliases: ["paint door", "door paint"]
  },
  "Paint - Cabinets": {
    cost: 45, price: 85, unit: "door", perUnit: true,
    category: "paint",
    aliases: ["paint cabinets", "cabinet painting"]
  },
  "Paint - Closet": {
    cost: 200, price: 333, unit: "ea", perUnit: true,
    category: "paint",
    aliases: ["paint closet", "closet paint"]
  },
  "Paint - Touch Up": {
    cost: 150, price: 275, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["touch up paint", "paint touch up", "patch and paint"]
  },

  // --- Drywall ---
  "Drywall - Patch": {
    cost: 150, price: 250, unit: "ea", perUnit: true,
    category: "paint",
    aliases: ["drywall patch", "patch hole", "repair drywall"]
  },
  "Drywall - New": {
    cost: 13, price: 22, unit: "sqft", perUnit: true,
    category: "paint",
    aliases: ["new drywall", "hang drywall", "sheetrock"]
  },
  "Ceiling Texture": {
    cost: 600, price: 1000, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["texture ceiling", "ceiling texture", "knockdown ceiling"]
  },
  "Ceiling Texture - Smooth": {
    cost: 800, price: 1333, unit: "ea", perUnit: false,
    category: "paint",
    aliases: ["smooth ceiling", "skim coat ceiling"]
  },


  // ============================================================================
  // FINISH CARPENTRY & TRIM
  // ============================================================================

  "Baseboard - Standard": {
    cost: 3.50, price: 6.50, unit: "LF", perUnit: true,
    category: "trim",
    aliases: ["baseboard", "base molding", "floor trim"]
  },
  "Baseboard - Custom": {
    cost: 6, price: 11, unit: "LF", perUnit: true,
    category: "trim",
    aliases: ["custom baseboard", "tall baseboard"]
  },
  "Crown Molding": {
    cost: 6, price: 12, unit: "LF", perUnit: true,
    category: "trim",
    aliases: ["crown", "crown molding"]
  },
  "Door Casing": {
    cost: 75, price: 140, unit: "door", perUnit: true,
    category: "trim",
    aliases: ["door trim", "door casing", "door frame"]
  },
  "Window Casing": {
    cost: 85, price: 160, unit: "window", perUnit: true,
    category: "trim",
    aliases: ["window trim", "window casing"]
  },
  "Wainscoting": {
    cost: 12, price: 22, unit: "sqft", perUnit: true,
    category: "trim",
    aliases: ["wainscoting", "wainscot", "board and batten"]
  },
  "Shiplap": {
    cost: 14, price: 26, unit: "sqft", perUnit: true,
    category: "trim",
    aliases: ["shiplap", "accent wall"]
  },
  "Floating Shelf": {
    cost: 85, price: 160, unit: "ea", perUnit: true,
    category: "trim",
    aliases: ["floating shelf", "wall shelf"]
  },


  // ============================================================================
  // DOORS
  // ============================================================================

  "Door - Interior": {
    cost: 350, price: 650, unit: "ea", perUnit: true,
    category: "doors",
    aliases: ["interior door", "new door", "bedroom door"]
  },
  "Door - Pocket": {
    cost: 800, price: 1400, unit: "ea", perUnit: true,
    category: "doors",
    aliases: ["pocket door", "sliding pocket door"]
  },
  "Door - Barn": {
    cost: 600, price: 1100, unit: "ea", perUnit: true,
    category: "doors",
    aliases: ["barn door", "sliding barn door"]
  },
  "Door Hardware": {
    cost: 45, price: 85, unit: "door", perUnit: true,
    category: "doors",
    aliases: ["door knob", "door handle", "door hardware"]
  },


  // ============================================================================
  // MECHANICALS & APPLIANCES
  // ============================================================================

  "HVAC Vent Relocation": {
    cost: 600, price: 1000, unit: "ea", perUnit: true,
    category: "mechanical",
    aliases: ["move vent", "relocate vent", "vent relocation"]
  },
  "Range Hood Duct": {
    cost: 450, price: 750, unit: "ea", perUnit: false,
    category: "mechanical",
    aliases: ["range hood duct", "hood venting", "exhaust duct"]
  },
  "Appliance Install - Standard": {
    cost: 350, price: 583, unit: "ea", perUnit: false,
    category: "mechanical",
    aliases: ["install appliances", "appliance installation"]
  },
  "Appliance Install - Built-In": {
    cost: 800, price: 1333, unit: "ea", perUnit: false,
    category: "mechanical",
    aliases: ["built-in install", "pro appliance install"]
  },


  // ============================================================================
  // ADMIN & MISCELLANEOUS
  // ============================================================================

  "Permit Fee": {
    cost: 500, price: 833, unit: "ea", perUnit: false,
    category: "admin",
    aliases: ["permit", "building permit"]
  },
  "Design Fee": {
    cost: 500, price: 833, unit: "ea", perUnit: false,
    category: "admin",
    aliases: ["design", "design services"]
  },
  "Project Management": {
    cost: 0, price: 500, unit: "ea", perUnit: false,
    category: "admin",
    aliases: ["project management", "pm fee"]
  },
  "HOA Approval Fee": {
    cost: 0, price: 500, unit: "ea", perUnit: false,
    category: "admin",
    aliases: ["hoa fee", "hoa approval"]
  },

  // --- Testing ---
  "Asbestos Test": {
    cost: 250, price: 450, unit: "ea", perUnit: false,
    category: "admin",
    aliases: ["asbestos testing", "asbestos test"]
  },
  "Lead Paint Test": {
    cost: 150, price: 280, unit: "ea", perUnit: false,
    category: "admin",
    aliases: ["lead test", "lead paint testing"]
  },

  // --- Final ---
  "Final Caulking": {
    cost: 150, price: 280, unit: "room", perUnit: true,
    category: "admin",
    aliases: ["caulking", "caulk", "seal", "final caulking"]
  },
  "Punchlist Labor": {
    cost: 85, price: 150, unit: "hour", perUnit: true,
    category: "admin",
    aliases: ["punchlist", "punch list", "final walkthrough"]
  },


  // ============================================================================
  // TILE MATERIAL ALLOWANCES (Client-Facing)
  // ============================================================================

  "Allowance - Wall Tile Material": {
    cost: 4.50, price: 7.50, unit: "sqft", perUnit: true,
    category: "allowance",
    aliases: ["wall tile allowance", "tile material"]
  },
  "Allowance - Floor Tile Material": {
    cost: 2.70, price: 4.50, unit: "sqft", perUnit: true,
    category: "allowance",
    aliases: ["floor tile allowance"]
  },
  "Allowance - Shower Floor Tile Material": {
    cost: 3.90, price: 6.50, unit: "sqft", perUnit: true,
    category: "allowance",
    aliases: ["shower floor tile allowance"]
  },

};


// ============================================================================
// CATEGORY METADATA
// ============================================================================

export const CATEGORY_METADATA: Record<string, { label: string; icon: string; order: number }> = {
  demo: { label: "Demolition & Site Prep", icon: "Hammer", order: 1 },
  framing: { label: "Structural & Framing", icon: "Home", order: 2 },
  plumbing: { label: "Plumbing", icon: "Droplets", order: 3 },
  electrical: { label: "Electrical", icon: "Zap", order: 4 },
  tile: { label: "Tile & Waterproofing", icon: "Layers", order: 5 },
  cabinetry: { label: "Cabinetry & Vanities", icon: "Bath", order: 6 },
  countertops: { label: "Countertops", icon: "Layers", order: 7 },
  fixtures: { label: "Fixtures & Allowances", icon: "Sparkles", order: 8 },
  glass: { label: "Glass", icon: "Shield", order: 9 },
  paint: { label: "Paint & Drywall", icon: "Palette", order: 10 },
  trim: { label: "Finish Carpentry & Trim", icon: "Scissors", order: 11 },
  doors: { label: "Doors", icon: "DoorOpen", order: 12 },
  mechanical: { label: "Mechanicals & Appliances", icon: "Thermometer", order: 13 },
  admin: { label: "Admin & Miscellaneous", icon: "FileText", order: 14 },
  allowance: { label: "Material Allowances", icon: "Info", order: 15 },
};


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find a pricing item by name or alias
 */
export function findPricingItem(searchTerm: string): { key: string; item: PricingItem } | null {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // First, try exact match on key
  for (const [key, item] of Object.entries(PRICING_TABLE)) {
    if (key.toLowerCase() === normalizedSearch) {
      return { key, item };
    }
  }
  
  // Then, try alias match
  for (const [key, item] of Object.entries(PRICING_TABLE)) {
    for (const alias of item.aliases) {
      if (alias.toLowerCase() === normalizedSearch) {
        return { key, item };
      }
    }
  }
  
  // Finally, try partial match
  for (const [key, item] of Object.entries(PRICING_TABLE)) {
    if (key.toLowerCase().includes(normalizedSearch) || 
        normalizedSearch.includes(key.toLowerCase())) {
      return { key, item };
    }
    for (const alias of item.aliases) {
      if (alias.toLowerCase().includes(normalizedSearch) ||
          normalizedSearch.includes(alias.toLowerCase())) {
        return { key, item };
      }
    }
  }
  
  return null;
}

/**
 * Calculate line item total
 */
export function calculateLineItemTotal(
  itemKey: string, 
  quantity: number
): { cost: number; price: number } | null {
  const found = findPricingItem(itemKey);
  if (!found) return null;
  
  const { item } = found;
  
  if (item.perUnit) {
    return {
      cost: Math.round(item.cost * quantity * 100) / 100,
      price: Math.round(item.price * quantity * 100) / 100
    };
  } else {
    return {
      cost: item.cost,
      price: item.price
    };
  }
}

/**
 * Get vanity size tier from inches
 */
export function getVanityTier(inches: number): string {
  if (inches <= 24) return "Vanity - 24in";
  if (inches <= 30) return "Vanity - 30in";
  if (inches <= 36) return "Vanity - 36in";
  if (inches <= 48) return "Vanity - 48in";
  if (inches <= 60) return "Vanity - 60in";
  if (inches <= 72) return "Vanity - 72in";
  if (inches <= 84) return "Vanity - 84in";
  if (inches <= 96) return "Vanity - 96in";
  if (inches <= 120) return "Vanity - 120in";
  return "Vanity - 144in";
}

/**
 * Calculate countertop sqft from vanity size
 */
export function calculateCountertopSqft(vanityInches: number, depth: number = 22): number {
  const lengthFeet = vanityInches / 12;
  const depthFeet = depth / 12;
  const sqft = lengthFeet * depthFeet;
  // Add 10% for overhang
  return Math.ceil(sqft * 1.1);
}

/**
 * Get all items in a category
 */
export function getItemsByCategory(category: string): Record<string, PricingItem> {
  const items: Record<string, PricingItem> = {};
  for (const [key, item] of Object.entries(PRICING_TABLE)) {
    if (item.category === category) {
      items[key] = item;
    }
  }
  return items;
}

/**
 * Get all categories with their items
 */
export function getAllCategoriesWithItems(): Array<{ 
  category: string; 
  metadata: { label: string; icon: string; order: number }; 
  items: Array<{ key: string; item: PricingItem }> 
}> {
  const result: Array<{ 
    category: string; 
    metadata: { label: string; icon: string; order: number }; 
    items: Array<{ key: string; item: PricingItem }> 
  }> = [];

  for (const [category, metadata] of Object.entries(CATEGORY_METADATA)) {
    const items: Array<{ key: string; item: PricingItem }> = [];
    for (const [key, item] of Object.entries(PRICING_TABLE)) {
      if (item.category === category) {
        items.push({ key, item });
      }
    }
    if (items.length > 0) {
      result.push({ category, metadata, items });
    }
  }

  return result.sort((a, b) => a.metadata.order - b.metadata.order);
}

/**
 * Apply margin to calculate price from cost
 */
export function applyMargin(cost: number, margin: number): number {
  return Math.round((cost / (1 - margin)) * 100) / 100;
}
