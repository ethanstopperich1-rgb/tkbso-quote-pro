// Comprehensive line item descriptions for customer-facing PDF proposals
// Each description includes task name, full description, and unit

export interface LineItemDescription {
  description: string;
  unit: string;
}

export const LINE_ITEM_DESCRIPTIONS: Record<string, LineItemDescription> = {
  // ============================================
  // DEMOLITION & SITE PREP
  // ============================================
  
  // Site Protection
  'site_protection': {
    description: 'Includes installation of heavy-duty floor covering, dust containment barriers, and jobsite protection prior to construction.',
    unit: 'each'
  },
  'floor_protection': {
    description: 'Includes installation of heavy-duty floor covering, dust containment barriers, and jobsite protection prior to construction.',
    unit: 'each'
  },
  'dust_barrier': {
    description: 'Includes setup of temporary barrier system to contain dust and protect occupied areas.',
    unit: 'per room'
  },
  'zipwall': {
    description: 'Includes setup of temporary barrier system to contain dust and protect occupied areas.',
    unit: 'per room'
  },
  'air_scrubber': {
    description: 'Includes setup of negative air machine to reduce airborne dust during construction in occupied homes.',
    unit: 'per week'
  },
  'hepa_system': {
    description: 'Includes setup of negative air machine to reduce airborne dust during construction in occupied homes.',
    unit: 'per week'
  },
  'furniture_handling': {
    description: 'Includes protection, moving, and repositioning of furniture and personal items as needed for access.',
    unit: 'per hour'
  },
  
  // Standard Demolition
  'demo_kitchen': {
    description: 'Includes removal of existing cabinets, countertops, appliances, backsplash, and associated debris.',
    unit: 'each'
  },
  'demo_full_kitchen': {
    description: 'Includes removal of existing cabinets, countertops, appliances, backsplash, and associated debris.',
    unit: 'each'
  },
  'demo_bathroom': {
    description: 'Includes removal of existing tile, vanity, shower/tub system, fixtures, and debris removal.',
    unit: 'each'
  },
  'demo_full_bath': {
    description: 'Includes removal of existing tile, vanity, shower/tub system, fixtures, and debris removal.',
    unit: 'each'
  },
  'demo_large_bath': {
    description: 'Includes removal of existing tile, vanity, shower/tub system, fixtures, and debris removal.',
    unit: 'each'
  },
  'demo_small_bath': {
    description: 'Includes removal of existing tile, vanity, shower/tub system, fixtures, and debris removal.',
    unit: 'each'
  },
  'demo_shower_only': {
    description: 'Includes removal of existing tile, shower fixtures, and debris removal.',
    unit: 'each'
  },
  'soffit_demolition': {
    description: 'Includes removal of ceiling soffits and disposal of debris.',
    unit: 'per LF'
  },
  'soffit_removal': {
    description: 'Includes removal of ceiling soffits and disposal of debris.',
    unit: 'per LF'
  },
  'cabinet_deconstruction': {
    description: 'Includes careful removal of cabinetry for reuse or relocation.',
    unit: 'each kitchen'
  },
  
  // Heavy / Difficult Demo
  'tile_removal_mud_set': {
    description: 'Includes removal of bonded mud-set tile using demolition tools and dust control methods.',
    unit: 'per sqft'
  },
  'cast_iron_tub_removal': {
    description: 'Includes breaking, safety handling, and removal of existing cast iron tub and debris.',
    unit: 'each'
  },
  'glued_flooring_removal': {
    description: 'Includes removal of glued wood, tile, or laminate flooring with surface preparation for new install.',
    unit: 'per sqft'
  },
  'popcorn_ceiling_removal': {
    description: 'Includes scraping existing texture, skim coating, and preparing ceiling for new finish.',
    unit: 'per sqft'
  },
  
  // Disposal & Logistics
  'dumpster': {
    description: 'Includes dumpster rental, delivery, removal, and disposal fees for renovation debris.',
    unit: 'each'
  },
  'dumpster_20_yard': {
    description: 'Includes dumpster rental, delivery, removal, and disposal fees for renovation debris.',
    unit: 'each'
  },
  'dumpster_bath': {
    description: 'Includes dumpster rental, delivery, removal, and disposal fees for renovation debris.',
    unit: 'each'
  },
  'dumpster_kitchen': {
    description: 'Includes dumpster rental, delivery, removal, and disposal fees for renovation debris.',
    unit: 'each'
  },
  'live_load_haul': {
    description: 'Includes debris removal using manual load-out and dump trailer or truck.',
    unit: 'per load'
  },
  'truck_haul': {
    description: 'Includes debris removal using manual load-out and dump trailer or truck.',
    unit: 'per load'
  },
  'difficult_access_fee': {
    description: 'Additional handling fee for debris movement through restricted access areas or multi-story structures.',
    unit: 'per job'
  },
  'stair_carry_fee': {
    description: 'Additional handling fee for debris movement through restricted access areas or multi-story structures.',
    unit: 'per job'
  },
  
  // Cleaning
  'post_construction_clean': {
    description: 'Includes final detailed cleaning of surfaces, fixtures, floors, and windows after construction completion.',
    unit: 'per job'
  },
  'deep_clean': {
    description: 'Includes final detailed cleaning of surfaces, fixtures, floors, and windows after construction completion.',
    unit: 'per job'
  },
  'daily_cleanup': {
    description: 'Includes sweeping, trash removal, and debris control during active construction.',
    unit: 'per day'
  },
  
  // Occupied Home Premiums
  'temporary_kitchen': {
    description: 'Includes setup of temporary sink, counter surface, and basic access to utilities during kitchen renovation.',
    unit: 'each'
  },
  'bathroom_trailer': {
    description: 'Includes delivery and weekly rental of on-site temporary bathroom facility.',
    unit: 'per week'
  },
  'quiet_hours_premium': {
    description: 'Includes modified work schedule to minimize noise during working or sleeping hours.',
    unit: 'per job'
  },
  'after_hours_work': {
    description: 'Includes labor scheduled outside standard business hours.',
    unit: 'per hour'
  },
  'weekend_work': {
    description: 'Includes labor scheduled outside standard business hours.',
    unit: 'per hour'
  },

  // ============================================
  // FRAMING
  // ============================================
  
  'framing_standard': {
    description: 'Includes framing for new walls, blocking, supports, and layout adjustments as needed for the new design.',
    unit: 'each'
  },
  'framing_wall': {
    description: 'Includes framing for new walls, blocking, supports, and layout adjustments as needed for the new design.',
    unit: 'each'
  },
  'framing_pony_wall': {
    description: 'Includes construction of a short partition wall for showers, glass mounting, or design separation.',
    unit: 'each'
  },
  'pony_wall': {
    description: 'Includes construction of a short partition wall for showers, glass mounting, or design separation.',
    unit: 'each'
  },
  'framing_niche': {
    description: 'Includes framing and preparation for recessed shower storage niche prior to tile installation.',
    unit: 'each'
  },
  'shower_niche': {
    description: 'Includes framing and preparation for recessed shower storage niche prior to tile installation.',
    unit: 'each'
  },
  'niche': {
    description: 'Includes framing and preparation for recessed shower storage niche prior to tile installation.',
    unit: 'each'
  },
  
  // Structural / Complex
  'wall_removal': {
    description: 'Includes demolition of existing wall and reconstruction based on new layout requirements.',
    unit: 'each'
  },
  'wall_rebuild': {
    description: 'Includes demolition of existing wall and reconstruction based on new layout requirements.',
    unit: 'each'
  },
  'door_relocation': {
    description: 'Includes modifying framing to relocate an interior doorway to new position.',
    unit: 'each'
  },
  'door_closure': {
    description: 'Includes removal of existing doorway and framing closure to create continuous finished wall.',
    unit: 'each'
  },
  'wall_patch': {
    description: 'Includes removal of existing doorway and framing closure to create continuous finished wall.',
    unit: 'each'
  },
  'shower_enlargement': {
    description: 'Includes modifications to expand the existing shower footprint based on design requirements.',
    unit: 'each'
  },
  'tub_relocation': {
    description: 'Includes framing adjustments and floor preparation to relocate existing tub footprint.',
    unit: 'each'
  },
  'toilet_relocation': {
    description: 'Includes floor framing modifications to support new toilet rough-in location.',
    unit: 'each'
  },
  'entrance_enlargement': {
    description: 'Includes modifications to expand the existing entrance opening based on design requirements.',
    unit: 'each'
  },
  
  // Water Damage & Rot Repair
  'subfloor_replacement': {
    description: 'Includes removal and replacement of damaged or compromised subfloor sections.',
    unit: 'per sqft'
  },
  'joist_reinforcement': {
    description: 'Includes reinforcement or duplication of floor joists to restore structural integrity.',
    unit: 'per linear foot'
  },
  'sistering': {
    description: 'Includes reinforcement or duplication of floor joists to restore structural integrity.',
    unit: 'per linear foot'
  },
  'mold_remediation': {
    description: 'Includes treatment and remediation of visible mold growth in affected areas.',
    unit: 'per area'
  },
  'moisture_barrier': {
    description: 'Includes installation of upgraded membrane to prevent future moisture intrusion.',
    unit: 'per sqft'
  },
  
  // Hidden Structural Issues
  'load_bearing_beam': {
    description: 'Includes installation of engineered beam to replace or modify load-bearing wall.',
    unit: 'each'
  },
  'foundation_repair': {
    description: 'Includes repair or reinforcement of slab or foundation where structurally necessary.',
    unit: 'each'
  },
  'slab_repair': {
    description: 'Includes repair or reinforcement of slab or foundation where structurally necessary.',
    unit: 'each'
  },
  'engineering_stamp': {
    description: 'Includes required engineering documentation, calculations, and stamped drawings for modifications.',
    unit: 'each'
  },
  'structural_drawings': {
    description: 'Includes required engineering documentation, calculations, and stamped drawings for modifications.',
    unit: 'each'
  },
  'temporary_shoring': {
    description: 'Includes setup and removal of temporary support structure needed during framing modification.',
    unit: 'each'
  },

  // ============================================
  // PLUMBING & GAS
  // ============================================
  
  // Standard Plumbing
  'plumbing_shower_standard': {
    description: 'Includes installation of shower valve, drain, supply lines, waterproofing tie-ins, and final trim.',
    unit: 'each'
  },
  'shower_rough_in': {
    description: 'Includes installation of shower valve, drain, supply lines, waterproofing tie-ins, and final trim.',
    unit: 'each'
  },
  'plumbing_extra_head': {
    description: 'Includes rough-in and connection for additional shower outlet components.',
    unit: 'each'
  },
  'extra_shower_head': {
    description: 'Includes rough-in and connection for additional shower outlet components.',
    unit: 'each'
  },
  'diverter': {
    description: 'Includes rough-in and connection for additional shower outlet components.',
    unit: 'each'
  },
  'plumbing_tub_to_shower': {
    description: 'Includes removal of tub plumbing and installation of complete shower rough-in connections.',
    unit: 'each'
  },
  'tub_to_shower': {
    description: 'Includes removal of tub plumbing and installation of complete shower rough-in connections.',
    unit: 'each'
  },
  'plumbing_tub_freestanding': {
    description: 'Includes drain connection, water supply tie-in, and leveling/placement of freestanding tub.',
    unit: 'each'
  },
  'freestanding_tub_install': {
    description: 'Includes drain connection, water supply tie-in, and leveling/placement of freestanding tub.',
    unit: 'each'
  },
  'plumbing_toilet': {
    description: 'Includes removal of old toilet and installation of new customer-supplied fixture.',
    unit: 'each'
  },
  'toilet_replacement': {
    description: 'Includes removal of old toilet and installation of new customer-supplied fixture.',
    unit: 'each'
  },
  'toilet_swap': {
    description: 'Includes removal of old toilet and installation of new customer-supplied fixture.',
    unit: 'each'
  },
  'plumbing_smart_valve': {
    description: 'Includes wiring and plumbing integration for digital or smart shower control system.',
    unit: 'each'
  },
  'smart_valve': {
    description: 'Includes wiring and plumbing integration for digital or smart shower control system.',
    unit: 'each'
  },
  'plumbing_linear_drain': {
    description: 'Includes installation, leveling, waterproofing integration, and final trim for linear drain.',
    unit: 'each'
  },
  'linear_drain': {
    description: 'Includes installation, leveling, waterproofing integration, and final trim for linear drain.',
    unit: 'each'
  },
  
  // Luxury Plumbing
  'steam_generator': {
    description: 'Includes installation of steam generator, control, and integration with shower enclosure.',
    unit: 'each'
  },
  'pot_filler': {
    description: 'Includes running dedicated line and installation of pot filler fixture above cooking area.',
    unit: 'each'
  },
  'pot_filler_install': {
    description: 'Includes running dedicated line and installation of pot filler fixture above cooking area.',
    unit: 'each'
  },
  'tankless_water_heater': {
    description: 'Includes installation and connection of tankless system in place of or supplementing existing heater.',
    unit: 'each'
  },
  
  // Specialty Plumbing Systems
  'recirculation_pump': {
    description: 'Includes installation of pump system to improve hot water delivery times to fixtures.',
    unit: 'each'
  },
  'water_softener_rough': {
    description: 'Includes plumbing preparation and connection points for future water softener system.',
    unit: 'each'
  },
  'pot_filler_rough': {
    description: 'Includes dedicated wall rough-in for future pot filler installation.',
    unit: 'each'
  },
  'ice_maker_line': {
    description: 'Includes installation of water supply line for refrigerator ice maker connection.',
    unit: 'per LF'
  },
  'pressure_balance_valve': {
    description: 'Includes installation of valve to stabilize water temperature and prevent fluctuation.',
    unit: 'per valve'
  },
  'steam_rough_in': {
    description: 'Includes electrical and plumbing preparation for future steam system installation.',
    unit: 'each'
  },
  'floor_heat_manifold': {
    description: 'Includes setup of connection manifold for heated flooring systems.',
    unit: 'each'
  },
  
  // Gas
  'gas_line_new': {
    description: 'Includes installation of new gas supply line to support added fixture or appliance.',
    unit: 'each'
  },
  'gas_line_extension': {
    description: 'Includes running line to range location for appliance connection.',
    unit: 'per LF'
  },

  // ============================================
  // ELECTRICAL
  // ============================================
  
  // Standard Electrical
  'electrical_recessed_can': {
    description: 'Includes cutting openings, installing recessed cans, wiring, switching, and final testing.',
    unit: 'each'
  },
  'recessed_lighting': {
    description: 'Includes cutting openings, installing recessed cans, wiring, switching, and final testing.',
    unit: 'each'
  },
  'recessed_can': {
    description: 'Includes cutting openings, installing recessed cans, wiring, switching, and final testing.',
    unit: 'each'
  },
  'electrical_vanity_light': {
    description: 'Includes mounting of vanity light fixture, wiring connections, and alignment for proper placement.',
    unit: 'each'
  },
  'vanity_light': {
    description: 'Includes mounting of vanity light fixture, wiring connections, and alignment for proper placement.',
    unit: 'each'
  },
  'electrical_small_package': {
    description: 'Includes basic outlet and switch modifications needed to support standard renovation layouts.',
    unit: 'each'
  },
  'electrical_kitchen_package': {
    description: 'Includes wiring for appliances, outlets, switches, and lighting per updated kitchen layout.',
    unit: 'each'
  },
  
  // Systems & Upgrades
  'panel_upgrade': {
    description: 'Includes replacement of existing electrical panel and capacity upgrade to support additional circuits.',
    unit: 'each'
  },
  '200_amp_service': {
    description: 'Includes replacement of existing electrical panel and capacity upgrade to support additional circuits.',
    unit: 'each'
  },
  '240v_circuit': {
    description: 'Includes wiring and breaker installation for appliances or specialty equipment requiring 240V power.',
    unit: 'each'
  },
  'dedicated_circuit': {
    description: 'Includes wiring and breaker installation for appliances or specialty equipment requiring 240V power.',
    unit: 'each'
  },
  'under_cabinet_lighting': {
    description: 'Includes wiring and installation of LED strip lighting beneath cabinetry for task and accent lighting.',
    unit: 'per cabinet run'
  },
  'led_lighting': {
    description: 'Includes wiring and installation of LED strip lighting beneath cabinetry for task and accent lighting.',
    unit: 'per cabinet run'
  },
  'heated_floor_electrical': {
    description: 'Includes installation of heating mat and controller wiring for electric heated flooring.',
    unit: 'per sqft'
  },
  
  // Smart Home & Specialty Electrical
  'toe_kick_lighting': {
    description: 'Includes wiring and installation of low-profile lighting at cabinet base locations.',
    unit: 'per linear foot'
  },
  'in_drawer_outlet': {
    description: 'Includes wiring and recessed outlet installation within cabinetry drawer system.',
    unit: 'each'
  },
  'usb_outlet': {
    description: 'Includes upgrade of standard outlet to integrated USB or USB-C charging outlet.',
    unit: 'each'
  },
  'smart_switch': {
    description: 'Includes installation and configuration of smart switch compatible with home automation systems.',
    unit: 'each'
  },
  'subpanel': {
    description: 'Includes installation of a secondary electrical distribution panel to support additional circuits.',
    unit: 'each'
  },
  'ev_charger_circuit': {
    description: 'Includes wiring and breaker installation for Level-2 electric vehicle charging.',
    unit: 'each'
  },
  'heat_lamp_fan': {
    description: 'Includes wiring and placement of combination exhaust fan with heat lamp and controls.',
    unit: 'each'
  },
  'exhaust_fan_install': {
    description: 'Includes wiring and placement of combination exhaust fan with heat lamp and controls.',
    unit: 'each'
  },
  
  // Code-Required Electrical Items
  'gfci_upgrade': {
    description: 'Includes replacement of outlet to GFCI-protected model where required by current code.',
    unit: 'per outlet'
  },
  'afci_breaker': {
    description: 'Includes installation of AFCI-protected breaker to meet current building code compliance.',
    unit: 'per circuit'
  },
  'vent_fan_upgrade': {
    description: 'Includes replacement or addition of exhaust fan to meet ventilation requirements.',
    unit: 'each'
  },
  'tempered_glass_upgrade': {
    description: 'Includes upgrade of glass components to tempered safety glass where legally required.',
    unit: 'each'
  },
  'egress_window': {
    description: 'Includes enlarging window opening and installing compliant window meeting egress requirements.',
    unit: 'each'
  },
  'handrail_code': {
    description: 'Includes supply and installation of safety handrail where required by building code.',
    unit: 'each'
  },

  // ============================================
  // TILE & FLOORING
  // ============================================
  
  // Tile & Waterproofing
  'tile_wall': {
    description: 'Includes layout, installation, grout, and cleanup of tile on vertical surfaces.',
    unit: 'per sqft'
  },
  'wall_tile': {
    description: 'Includes layout, installation, grout, and cleanup of tile on vertical surfaces.',
    unit: 'per sqft'
  },
  'tile_shower_floor': {
    description: 'Includes installation of tile on shower floor with slope consideration and drain alignment.',
    unit: 'per sqft'
  },
  'shower_floor_tile': {
    description: 'Includes installation of tile on shower floor with slope consideration and drain alignment.',
    unit: 'per sqft'
  },
  'tile_main_floor': {
    description: 'Includes installation of tile on main floor surfaces, grouting, and detailing.',
    unit: 'per sqft'
  },
  'tile_floor': {
    description: 'Includes installation of tile on main floor surfaces, grouting, and detailing.',
    unit: 'per sqft'
  },
  'floor_tile': {
    description: 'Includes installation of tile on main floor surfaces, grouting, and detailing.',
    unit: 'per sqft'
  },
  'cement_board': {
    description: 'Includes installation of cement board substrate for tile installation.',
    unit: 'per sqft'
  },
  'backer_board': {
    description: 'Includes installation of cement board substrate for tile installation.',
    unit: 'per sqft'
  },
  'waterproofing': {
    description: 'Includes application of waterproofing membrane for wet-area protection.',
    unit: 'per sqft'
  },
  'waterproofing_system': {
    description: 'Includes application of waterproofing membrane for wet-area protection.',
    unit: 'per sqft'
  },
  'floor_leveling': {
    description: 'Includes installation of self-leveling compound for floor preparation prior to finish install.',
    unit: 'each'
  },
  
  // Tile Specialty Upgrades
  'accent_tile_band': {
    description: 'Includes layout and installation of decorative tile accent band.',
    unit: 'per linear foot'
  },
  'herringbone_pattern': {
    description: 'Includes additional layout time and precision installation for herringbone pattern tile.',
    unit: 'per sqft'
  },
  'large_format_tile': {
    description: 'Includes additional handling and precision alignment for oversized tile materials.',
    unit: 'per sqft'
  },
  'mosaic_tile': {
    description: 'Includes installation of small-format mosaic or penny tile requiring detailed layout and grouting.',
    unit: 'per sqft'
  },
  'penny_tile': {
    description: 'Includes installation of small-format mosaic or penny tile requiring detailed layout and grouting.',
    unit: 'per sqft'
  },
  'bullnose_tile': {
    description: 'Includes installation of bullnose or decorative trim tile at exposed edges.',
    unit: 'per LF'
  },
  'trim_tile': {
    description: 'Includes installation of bullnose or decorative trim tile at exposed edges.',
    unit: 'per LF'
  },
  'shower_curb_tile': {
    description: 'Includes installation of tile cap on shower curb surface.',
    unit: 'per LF'
  },
  'schluter_profile': {
    description: 'Includes installation of metal edge profile for clean transition and finish.',
    unit: 'per LF'
  },
  'heated_floor_tile': {
    description: 'Includes installation of tile over electrical heating system with proper substrate integration.',
    unit: 'per sqft'
  },
  
  // Flooring
  'lvp_install': {
    description: 'Includes installation of luxury vinyl plank flooring over prepared subfloor.',
    unit: 'per sqft'
  },
  'lvp_flooring': {
    description: 'Includes installation of luxury vinyl plank flooring over prepared subfloor.',
    unit: 'per sqft'
  },
  'laminate_install': {
    description: 'Includes installation of laminate flooring aligned to layout and room transitions.',
    unit: 'per sqft'
  },
  'hardwood_install': {
    description: 'Includes precision installation of hardwood flooring planks on prepared substrate.',
    unit: 'per sqft'
  },
  'hardwood_refinish': {
    description: 'Includes sanding, stain application, and finish sealing of existing hardwood.',
    unit: 'per sqft'
  },
  'floor_underlayment': {
    description: 'Includes installation of appropriate underlayment for moisture protection and acoustic benefit.',
    unit: 'per sqft'
  },
  'barrier_install': {
    description: 'Includes installation of appropriate underlayment for moisture protection and acoustic benefit.',
    unit: 'per sqft'
  },

  // ============================================
  // CABINETRY & VANITIES
  // ============================================
  
  'cabinet_package': {
    description: 'Includes delivery, assembly (if applicable), installation, leveling, and anchoring of cabinetry.',
    unit: 'per box'
  },
  'cabinetry_package': {
    description: 'Includes delivery, assembly (if applicable), installation, leveling, and anchoring of cabinetry.',
    unit: 'per box'
  },
  'cabinets': {
    description: 'Includes delivery, assembly (if applicable), installation, leveling, and anchoring of cabinetry.',
    unit: 'per box'
  },
  'cabinetry': {
    description: 'Includes delivery, assembly (if applicable), installation, leveling, and anchoring of cabinetry.',
    unit: 'per box'
  },
  'cabinet_install': {
    description: 'Includes installation of customer-provided cabinets including leveling and fastening.',
    unit: 'per box'
  },
  'cabinet_labor_only': {
    description: 'Includes installation of customer-provided cabinets including leveling and fastening.',
    unit: 'per box'
  },
  'vanity_30': {
    description: 'Includes vanity cabinet, countertop, sink, and basic plumbing preparation for installation.',
    unit: 'each'
  },
  'vanity_36': {
    description: 'Includes vanity cabinet, countertop, sink, and basic plumbing preparation for installation.',
    unit: 'each'
  },
  'vanity_48': {
    description: 'Includes vanity cabinet, countertop, sink, and basic plumbing preparation for installation.',
    unit: 'each'
  },
  'vanity_60': {
    description: 'Includes double-sink vanity cabinet, countertop, sinks, and basic plumbing preparation.',
    unit: 'each'
  },
  'vanity_72': {
    description: 'Includes double-sink vanity cabinet, countertop, sinks, and plumbing prep for final installation.',
    unit: 'each'
  },
  'vanity_84': {
    description: 'Includes oversized double-sink vanity cabinet, countertop, sinks, and plumbing prep.',
    unit: 'each'
  },
  'vanity_96': {
    description: 'Includes oversized custom-length double-sink vanity, countertop, sinks, and plumbing prep.',
    unit: 'each'
  },
  'quartz_countertop': {
    description: 'Includes measurement, fabrication, delivery, and installation of quartz countertop surfaces.',
    unit: 'per sqft'
  },
  'quartz_countertops': {
    description: 'Includes measurement, fabrication, delivery, and installation of quartz countertop surfaces.',
    unit: 'per sqft'
  },
  'countertop': {
    description: 'Includes measurement, fabrication, delivery, and installation of countertop surfaces.',
    unit: 'per sqft'
  },
  'countertops': {
    description: 'Includes measurement, fabrication, delivery, and installation of countertop surfaces.',
    unit: 'per sqft'
  },
  'laminate_countertop': {
    description: 'Includes measurement, fabrication, delivery, and installation of laminate countertop surfaces.',
    unit: 'per sqft'
  },
  'laminate_countertops': {
    description: 'Includes measurement, fabrication, delivery, and installation of laminate countertop surfaces.',
    unit: 'per sqft'
  },
  'granite_countertop': {
    description: 'Includes measurement, fabrication, delivery, and installation of granite countertop surfaces.',
    unit: 'per sqft'
  },
  'granite_countertops': {
    description: 'Includes measurement, fabrication, delivery, and installation of granite countertop surfaces.',
    unit: 'per sqft'
  },
  'butcher_block_countertop': {
    description: 'Includes measurement, fabrication, delivery, and installation of butcher block countertop surfaces.',
    unit: 'per sqft'
  },
  
  // Cabinet Customization
  'soft_close_hinge': {
    description: 'Includes replacement of standard hinges with soft-close hardware for smoother operation.',
    unit: 'per door'
  },
  'pull_out_trash': {
    description: 'Includes installation of concealed pull-out trash and recycling bin system inside cabinetry.',
    unit: 'each'
  },
  'lazy_susan': {
    description: 'Includes installation of rotating storage mechanism for corner cabinet.',
    unit: 'each'
  },
  'spice_rack_pullout': {
    description: 'Includes installation of slide-out spice organizer within base or upper cabinet.',
    unit: 'each'
  },
  'tray_divider': {
    description: 'Includes installation of dividers for bakeware, cutting boards, or sheet pans.',
    unit: 'each'
  },
  'drawer_peg_system': {
    description: 'Includes adjustable peg system for organization of dishes inside drawer base cabinetry.',
    unit: 'per drawer'
  },
  'appliance_garage': {
    description: 'Includes installation of countertop cabinet enclosure for stored small appliances.',
    unit: 'each'
  },
  'open_shelving': {
    description: 'Includes modification of cabinet structure to convert section into open-shelf storage.',
    unit: 'per section'
  },
  'glass_door_insert': {
    description: 'Includes installation of decorative or frosted glass panel within existing cabinet door frame.',
    unit: 'per door'
  },
  
  // Countertop Fabrication Add-Ons
  'undermount_sink_cutout': {
    description: 'Includes fabrication of countertop cutout and polishing to accommodate undermount sink.',
    unit: 'each'
  },
  'cooktop_cutout': {
    description: 'Includes fabrication of opening and edge finish for built-in cooktop.',
    unit: 'each'
  },
  'edge_profile_upgrade': {
    description: 'Includes upgraded edge detail such as ogee, waterfall bevel, or specialty profile.',
    unit: 'per edge'
  },
  'full_height_backsplash': {
    description: 'Includes fabrication and installation of stone slab backsplash above countertop.',
    unit: 'per sqft'
  },
  'outlet_cutout_slab': {
    description: 'Includes precision fabrication of cutouts in stone backsplash for electrical outlets.',
    unit: 'each'
  },
  'waterfall_edge': {
    description: 'Includes fabrication and installation of vertical slab extension with mitered corner joints.',
    unit: 'per edge'
  },
  'mitered_edge': {
    description: 'Includes fabrication and installation of vertical slab extension with mitered corner joints.',
    unit: 'per edge'
  },

  // ============================================
  // PAINT & DRYWALL
  // ============================================
  
  'paint_walls_ceilings': {
    description: 'Includes prep, primer, and finish coats using standard paint system.',
    unit: 'per sqft'
  },
  'interior_paint': {
    description: 'Includes prep, primer, and finish coats using standard paint system.',
    unit: 'per sqft'
  },
  'paint_patch': {
    description: 'Includes patching small areas and spot painting to blend with existing walls.',
    unit: 'each'
  },
  'patch_touchup': {
    description: 'Includes patching small areas and spot painting to blend with existing walls.',
    unit: 'each'
  },
  'paint_patch_bath': {
    description: 'Includes patching small areas and spot painting to blend with existing walls.',
    unit: 'each'
  },
  'post_job_touchups': {
    description: 'Includes scheduled return visit to address minor paint adjustments after completion.',
    unit: 'each'
  },
  'paint_full_bath': {
    description: 'Includes painting of walls, ceiling, trim, and door in bathroom space.',
    unit: 'each'
  },
  'full_bathroom_paint': {
    description: 'Includes painting of walls, ceiling, trim, and door in bathroom space.',
    unit: 'each'
  },
  'paint_full_kitchen': {
    description: 'Includes painting of walls, ceilings, trim, and touch-ups throughout kitchen.',
    unit: 'each'
  },
  'paint_trim': {
    description: 'Includes masking, prep, and painting of baseboards and trim.',
    unit: 'per linear foot'
  },
  'paint_baseboards': {
    description: 'Includes masking, prep, and painting of baseboards and trim.',
    unit: 'per linear foot'
  },
  'paint_ceiling': {
    description: 'Includes preparation and painting of ceiling surface only.',
    unit: 'each'
  },
  'door_paint': {
    description: 'Includes sanding, prep, and painting of interior door surface on both sides.',
    unit: 'each'
  },
  'stair_railing_paint': {
    description: 'Includes prep, sanding, and application of stain or paint finish to stair railing.',
    unit: 'each'
  },
  'cabinet_paint': {
    description: 'Includes sanding, prep, priming, and finish spraying of cabinet doors.',
    unit: 'per door'
  },
  'exterior_paint_siding': {
    description: 'Includes prep and finish painting of exterior siding.',
    unit: 'per sqft'
  },
  'exterior_trim_paint': {
    description: 'Includes prep and finish of exterior trim components.',
    unit: 'per linear foot'
  },
  'front_door_paint': {
    description: 'Includes refinishing or repainting of front entry door.',
    unit: 'each'
  },
  'shutter_paint': {
    description: 'Includes removal (if needed), prep, paint or stain of shutters.',
    unit: 'each'
  },
  'deck_stain': {
    description: 'Includes preparation and application of stain or paint to decking or fencing.',
    unit: 'per sqft'
  },
  'fence_stain': {
    description: 'Includes preparation and application of stain or paint to decking or fencing.',
    unit: 'per sqft'
  },
  'wallpaper_removal': {
    description: 'Includes removal of existing wallpaper and surface prep.',
    unit: 'per sqft'
  },
  'wallpaper_install': {
    description: 'Includes layout, adhesive application, and installation of wallpaper.',
    unit: 'per sqft'
  },
  'accent_wall_paint': {
    description: 'Includes painting of designated feature wall with specialty color.',
    unit: 'each'
  },
  'drywall_install': {
    description: 'Includes hanging, taping, mudding, sanding, and prep for paint.',
    unit: 'per sqft'
  },
  'drywall_repair': {
    description: 'Includes hanging, taping, mudding, sanding, and prep for paint.',
    unit: 'per sqft'
  },

  // ============================================
  // GLASS
  // ============================================
  
  'glass_shower_standard': {
    description: 'Includes measurement, fabrication, hardware, and installation of frameless tempered glass panel and hinged door.',
    unit: 'each'
  },
  'shower_glass_door_panel': {
    description: 'Includes measurement, fabrication, hardware, and installation of frameless tempered glass panel and hinged door.',
    unit: 'each'
  },
  'glass_panel_only': {
    description: 'Includes fabrication and installation of a single frameless fixed panel.',
    unit: 'each'
  },
  'fixed_glass_panel': {
    description: 'Includes fabrication and installation of a single frameless fixed panel.',
    unit: 'each'
  },
  'glass_90_return': {
    description: 'Includes fabrication and installation of two-panel glass system with corner return.',
    unit: 'each'
  },
  '90_degree_return': {
    description: 'Includes fabrication and installation of two-panel glass system with corner return.',
    unit: 'each'
  },

  // ============================================
  // TRIM, MILLWORK & DECORATIVE FINISHES
  // ============================================
  
  // Finish Carpentry & Millwork
  'baseboard_install': {
    description: 'Includes cutting, fitting, fastening, and caulking of new baseboards prior to paint.',
    unit: 'per linear foot'
  },
  'crown_molding': {
    description: 'Includes cutting, coping, fastening, and caulking of new crown molding for a finished look.',
    unit: 'per linear foot'
  },
  'window_casing': {
    description: 'Includes installation of trim casing around door or window openings.',
    unit: 'per opening'
  },
  'door_casing': {
    description: 'Includes installation of trim casing around door or window openings.',
    unit: 'per opening'
  },
  'shoe_molding': {
    description: 'Includes installation of shoe molding or quarter round at flooring transitions and wall edges.',
    unit: 'per linear foot'
  },
  'quarter_round': {
    description: 'Includes installation of shoe molding or quarter round at flooring transitions and wall edges.',
    unit: 'per linear foot'
  },
  'wainscoting': {
    description: 'Includes layout, fastening, and installation of decorative wall treatment and prep for paint.',
    unit: 'per sqft'
  },
  'shiplap': {
    description: 'Includes layout, fastening, and installation of decorative wall treatment and prep for paint.',
    unit: 'per sqft'
  },
  
  // Trim & Millwork Upgrades
  'custom_baseboards': {
    description: 'Includes installation of premium or stained baseboard material with finished detailing.',
    unit: 'per linear foot'
  },
  'stained_baseboards': {
    description: 'Includes installation of premium or stained baseboard material with finished detailing.',
    unit: 'per linear foot'
  },
  'chair_rail': {
    description: 'Includes installation of decorative chair rail trim to add detail and architectural definition.',
    unit: 'per linear foot'
  },
  'window_casing_replacement': {
    description: 'Includes removal of existing casing and installation of upgraded trim profile.',
    unit: 'per window'
  },
  'door_casing_replacement': {
    description: 'Includes removal and replacement of existing door casing with new upgraded trim.',
    unit: 'per door'
  },
  'coffered_ceiling': {
    description: 'Includes layout, framing, and installation of decorative coffered ceiling detail.',
    unit: 'per sqft'
  },
  'custom_built_in': {
    description: 'Includes fabrication and installation of built-in cabinetry, shelving, or wall system.',
    unit: 'per linear foot'
  },
  'floating_shelf': {
    description: 'Includes installation and anchoring of floating shelves for a clean, minimal appearance.',
    unit: 'per shelf'
  },
  
  // Decorative Finishes
  'accent_wall_shiplap': {
    description: 'Includes layout, installation, and finishing of decorative wood panel accent wall.',
    unit: 'per sqft'
  },
  'board_and_batten': {
    description: 'Includes layout, installation, and finishing of decorative wood panel accent wall.',
    unit: 'per sqft'
  },
  'ceiling_beam': {
    description: 'Includes installation of decorative or structural ceiling beams to elevate architecture.',
    unit: 'per linear foot'
  },
  'fireplace_surround': {
    description: 'Includes tile installation, alignment, and finishing around fireplace enclosure.',
    unit: 'each'
  },
  'custom_mirror_frame': {
    description: 'Includes fabrication and installation of frame around existing or new mirror.',
    unit: 'each'
  },
  'recessed_medicine_cabinet': {
    description: 'Includes framing, drywall adjustments, and installation of recessed medicine cabinet.',
    unit: 'each'
  },
  'niche_led_lighting': {
    description: 'Includes wiring and installation of LED lighting within decorative niche or recessed detail.',
    unit: 'per niche'
  },
  'grout_sealing': {
    description: 'Includes applying grout sealant to maintain finish and prevent discoloration.',
    unit: 'per sqft'
  },

  // ============================================
  // MECHANICALS & APPLIANCES
  // ============================================
  
  'hvac_vent_relocate': {
    description: 'Includes adjusting or relocating HVAC supply or return vent to fit revised layout.',
    unit: 'each'
  },
  'range_hood_ducting': {
    description: 'Includes routing ductwork and venting for kitchen range hood system.',
    unit: 'each'
  },
  'appliance_install_standard': {
    description: 'Includes installation of standard appliances such as dishwasher, microwave, or oven.',
    unit: 'per kitchen'
  },
  'appliance_install_pro': {
    description: 'Includes installation of built-in or panel-ready appliances requiring additional handling and alignment.',
    unit: 'per kitchen'
  },

  // ============================================
  // ADMINISTRATIVE, LOGISTICS & CONTINGENCY
  // ============================================
  
  // Logistics & Admin
  'permit_fee': {
    description: 'Includes permitting costs, inspection scheduling, and documentation management throughout the project.',
    unit: 'per job'
  },
  'permit_admin_fee': {
    description: 'Includes permitting costs, inspection scheduling, and documentation management throughout the project.',
    unit: 'per job'
  },
  'gc_permit_fee': {
    description: 'Includes permitting costs, inspection scheduling, and documentation management throughout the project.',
    unit: 'per job'
  },
  'portable_restroom': {
    description: 'Includes delivery and monthly rental of contractor portable restroom for projects requiring site facilities.',
    unit: 'per month'
  },
  'engineering_architectural': {
    description: 'Includes state-licensed stamped documents required for structural or mechanical modifications.',
    unit: 'per job'
  },
  'hoa_compliance_fee': {
    description: 'Includes scheduling, approvals, and coordination required for HOA-regulated properties.',
    unit: 'per job'
  },
  'condo_access_fee': {
    description: 'Includes scheduling, approvals, and coordination required for HOA-regulated properties.',
    unit: 'per job'
  },
  
  // Contingency & Protection
  'asbestos_testing': {
    description: 'Includes lab-based testing and reporting for suspected asbestos-containing materials.',
    unit: 'each'
  },
  'lead_paint_testing': {
    description: 'Includes sampling and testing for lead content in existing painted surfaces.',
    unit: 'each'
  },
  'warranty_registration': {
    description: 'Includes handling, documentation, and registration of product and workmanship warranties.',
    unit: 'per job'
  },
  'as_built_documentation': {
    description: 'Includes final drawings and documentation reflecting actual built conditions during construction.',
    unit: 'per job'
  },
  'post_project_touchup': {
    description: 'Includes scheduled final pass-through to address minor fit-and-finish adjustments.',
    unit: 'per visit'
  },
  
  // Commonly Missed Items
  'interior_door_replacement': {
    description: 'Includes removal and installation of new interior door slab and hardware alignment.',
    unit: 'per door'
  },
  'door_hardware_upgrade': {
    description: 'Includes installation of upgraded knob or lever hardware.',
    unit: 'per door'
  },
  'closet_shelving': {
    description: 'Includes layout, installation, and leveling of standard closet shelving system.',
    unit: 'per closet'
  },
  'towel_bar_install': {
    description: 'Includes installation and mounting of bathroom accessories.',
    unit: 'per fixture'
  },
  'toilet_paper_holder': {
    description: 'Includes installation and mounting of bathroom accessories.',
    unit: 'per fixture'
  },
  'grab_bar': {
    description: 'Includes installation of safety grab bar with secure mounting to structural backing.',
    unit: 'each'
  },
  'curved_shower_rod': {
    description: 'Includes installation of curved shower rod for expanded shower clearance.',
    unit: 'each'
  },
  'final_caulking': {
    description: 'Includes final interior caulking of trim, corners, and wet areas.',
    unit: 'per room'
  },
  'touchup_paint_kit': {
    description: 'Includes touch-up paint and labeled samples to match project finishes.',
    unit: 'per job'
  },
  'punchlist_hourly': {
    description: 'Includes time allocated for final corrections or adjustments noted during walkthrough.',
    unit: 'per hour'
  },
  'final_walkthrough': {
    description: 'Includes time allocated for final corrections or adjustments noted during walkthrough.',
    unit: 'per hour'
  },

  // ============================================
  // MATERIAL ALLOWANCES
  // ============================================
  
  'wall_tile_allowance': {
    description: 'Material allowance for wall tile selections.',
    unit: 'per sqft'
  },
  'tile_material_allowance': {
    description: 'Material allowance for wall tile selections.',
    unit: 'per sqft'
  },
  'floor_tile_allowance': {
    description: 'Material allowance for floor tile.',
    unit: 'per sqft'
  },
  'quartz_slab_allowance': {
    description: 'Material allowance for standard-level quartz countertop slab.',
    unit: 'per slab'
  },
  'granite_slab_allowance': {
    description: 'Material allowance for granite slab selection.',
    unit: 'per slab'
  },
  'quartzite_slab_allowance': {
    description: 'Material allowance for premium quartzite slab material.',
    unit: 'per slab'
  },
  'plumbing_fixture_allowance': {
    description: 'Allowance for standard bathroom plumbing fixtures including faucet, valve, and trim.',
    unit: 'per bathroom'
  },
  'bathroom_fixture_allowance': {
    description: 'Allowance for standard bathroom plumbing fixtures including faucet, valve, and trim.',
    unit: 'per bathroom'
  },
  'toilet_allowance': {
    description: 'Material allowance for new toilet selection.',
    unit: 'each'
  },
  'sink_faucet_allowance': {
    description: 'Allowance for customer-selected sink faucet.',
    unit: 'each'
  },
  'shower_trim_kit_allowance': {
    description: 'Allowance for matched trim set for shower.',
    unit: 'each'
  },
  'tub_allowance': {
    description: 'Allowance for standard fiberglass or acrylic tub selection.',
    unit: 'each'
  },
  'regular_tub_allowance': {
    description: 'Allowance for standard fiberglass or acrylic tub selection.',
    unit: 'each'
  },
  'tub_filler_allowance': {
    description: 'Allowance for tub filler fixture selection.',
    unit: 'each'
  },
  'freestanding_tub_allowance': {
    description: 'Allowance for freestanding tub material.',
    unit: 'each'
  },
  'mirror_allowance': {
    description: 'Allowance toward bathroom mirror purchase.',
    unit: 'each'
  },
  'lighting_fixture_allowance': {
    description: 'Allowance toward decorative lighting fixtures.',
    unit: 'each'
  },
  'cabinet_hardware_allowance': {
    description: 'Allowance toward pulls or knobs for cabinetry.',
    unit: 'each'
  },
  'hardware_allowance': {
    description: 'Allowance toward pulls or knobs for cabinetry.',
    unit: 'each'
  },
  'kitchen_faucet_allowance': {
    description: 'Allowance toward kitchen faucet fixture selection.',
    unit: 'each'
  },
  'garbage_disposal_allowance': {
    description: 'Allowance toward standard under-sink disposal unit.',
    unit: 'each'
  },
};

/**
 * Get the professional description for a line item based on its task description
 * Falls back to original description if no match found
 */
export function getLineItemDescription(taskDescription: string): LineItemDescription | null {
  // Normalize the task description for matching
  const normalizedTask = taskDescription
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
  
  // Direct lookup
  if (LINE_ITEM_DESCRIPTIONS[normalizedTask]) {
    return LINE_ITEM_DESCRIPTIONS[normalizedTask];
  }
  
  // Try partial matches - prioritize longer key matches for better accuracy
  const partialMatches: Array<{ key: string; value: LineItemDescription; score: number }> = [];
  for (const [key, value] of Object.entries(LINE_ITEM_DESCRIPTIONS)) {
    if (normalizedTask.includes(key)) {
      partialMatches.push({ key, value, score: key.length });
    } else if (key.includes(normalizedTask)) {
      partialMatches.push({ key, value, score: normalizedTask.length });
    }
  }
  
  if (partialMatches.length > 0) {
    // Return the match with the longest key (most specific)
    partialMatches.sort((a, b) => b.score - a.score);
    return partialMatches[0].value;
  }
  
  // Try keyword matching with priority for more specific keywords
  const keywords = normalizedTask.split('_').filter(w => w.length > 2);
  // Sort keywords by length (longer = more specific) and filter out generic words
  const genericWords = ['install', 'package', 'standard', 'basic', 'full', 'small', 'large', 'new', 'the', 'and', 'for'];
  const specificKeywords = keywords
    .filter(k => !genericWords.includes(k))
    .sort((a, b) => b.length - a.length);
  
  // Try matching with specific keywords first
  for (const keyword of specificKeywords) {
    const keywordMatches: Array<{ key: string; value: LineItemDescription; score: number }> = [];
    for (const [key, value] of Object.entries(LINE_ITEM_DESCRIPTIONS)) {
      if (key.includes(keyword)) {
        // Score based on how much of the key matches
        const score = keyword.length / key.length;
        keywordMatches.push({ key, value, score });
      }
    }
    if (keywordMatches.length > 0) {
      // Return the best scoring match
      keywordMatches.sort((a, b) => b.score - a.score);
      return keywordMatches[0].value;
    }
  }
  
  return null;
}

/**
 * Format a line item for PDF display with professional description
 */
export function formatLineItemForPdf(
  taskDescription: string,
  quantity?: number,
  unit?: string
): string {
  const matched = getLineItemDescription(taskDescription);
  
  if (matched) {
    // Use the professional description
    let formatted = matched.description;
    if (quantity && quantity > 1) {
      formatted += ` (${quantity} ${matched.unit})`;
    }
    return formatted;
  }
  
  // Fallback to original with quantity
  if (quantity && unit) {
    return `${taskDescription} (${quantity} ${unit})`;
  }
  
  return taskDescription;
}
