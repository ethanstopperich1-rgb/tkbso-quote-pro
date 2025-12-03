export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          chat_session_id: string
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string | null
          sender_profile_id: string | null
          sender_type: string
        }
        Insert: {
          chat_session_id: string
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          sender_profile_id?: string | null
          sender_type: string
        }
        Update: {
          chat_session_id?: string
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          sender_profile_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          contractor_id: string
          created_at: string | null
          created_by_profile_id: string | null
          current_job_state: Json | null
          id: string
          job_label: string | null
          linked_estimate_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          created_by_profile_id?: string | null
          current_job_state?: Json | null
          id?: string
          job_label?: string | null
          linked_estimate_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          created_by_profile_id?: string | null
          current_job_state?: Json | null
          id?: string
          job_label?: string | null
          linked_estimate_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_linked_estimate_id_fkey"
            columns: ["linked_estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          service_area: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          service_area?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          service_area?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      estimates: {
        Row: {
          bath_countertop_sqft: number | null
          bath_floor_tile_sqft: number | null
          bath_frameless_glass_sqft: number | null
          bath_scope_level: string | null
          bath_shower_floor_tile_sqft: number | null
          bath_shower_only_sqft: number | null
          bath_uses_frameless_glass: boolean | null
          bath_uses_tkbso_vanities: boolean | null
          bath_vanity_supplier_cost_ic: number | null
          bath_wall_tile_sqft: number | null
          baths_cp_total: number | null
          baths_ic_total: number | null
          cabinets_cp_total: number | null
          cabinets_ic_total: number | null
          cement_board_cp_total: number | null
          cement_board_ic_total: number | null
          city: string | null
          client_email: string | null
          client_estimate_text: string | null
          client_name: string | null
          client_phone: string | null
          closet_scope_level: string | null
          closets_cp_total: number | null
          closets_ic_total: number | null
          contractor_id: string
          created_at: string | null
          created_by_profile_id: string | null
          demo_cp_total: number | null
          demo_ic_total: number | null
          final_cp_total: number | null
          final_ic_total: number | null
          gc_permit_cp_total: number | null
          gc_permit_ic_total: number | null
          glass_cp_total: number | null
          glass_ic_total: number | null
          glass_type: string | null
          has_bathrooms: boolean | null
          has_closets: boolean | null
          has_kitchen: boolean | null
          high_estimate_cp: number | null
          id: string
          include_demo: boolean | null
          include_electrical: boolean | null
          include_glass: boolean | null
          include_management_fee: boolean | null
          include_paint: boolean | null
          include_plumbing: boolean | null
          include_waterproofing: boolean | null
          internal_json_payload: Json | null
          job_label: string | null
          job_notes: string | null
          kitchen_cabinet_supplier_cost_ic: number | null
          kitchen_countertop_sqft: number | null
          kitchen_cp_total: number | null
          kitchen_ic_total: number | null
          kitchen_scope_level: string | null
          kitchen_uses_tkbso_cabinets: boolean | null
          lighting_cp_total: number | null
          lighting_ic_total: number | null
          low_estimate_cp: number | null
          management_fee_cp: number | null
          management_fee_ic: number | null
          management_fee_percent: number | null
          needs_gc_partner: boolean | null
          num_bathrooms: number | null
          num_closets: number | null
          num_kitchens: number | null
          num_recessed_cans: number | null
          num_toilets: number | null
          num_vanity_lights: number | null
          other_cp_total: number | null
          other_ic_total: number | null
          paint_cp_total: number | null
          paint_ic_total: number | null
          permit_required: boolean | null
          plumbing_cp_total: number | null
          plumbing_ic_total: number | null
          property_address: string | null
          quartz_cp_total: number | null
          quartz_ic_total: number | null
          state: string | null
          status: string | null
          subtotal_cp_before_min_job: number | null
          subtotal_ic_before_min_job: number | null
          tile_cp_total: number | null
          tile_ic_total: number | null
          total_bathroom_sqft: number | null
          total_closet_sqft: number | null
          total_kitchen_sqft: number | null
          updated_at: string | null
          vanities_cp_total: number | null
          vanities_ic_total: number | null
          vanity_size: string | null
          waterproofing_cp_total: number | null
          waterproofing_ic_total: number | null
          zip: string | null
        }
        Insert: {
          bath_countertop_sqft?: number | null
          bath_floor_tile_sqft?: number | null
          bath_frameless_glass_sqft?: number | null
          bath_scope_level?: string | null
          bath_shower_floor_tile_sqft?: number | null
          bath_shower_only_sqft?: number | null
          bath_uses_frameless_glass?: boolean | null
          bath_uses_tkbso_vanities?: boolean | null
          bath_vanity_supplier_cost_ic?: number | null
          bath_wall_tile_sqft?: number | null
          baths_cp_total?: number | null
          baths_ic_total?: number | null
          cabinets_cp_total?: number | null
          cabinets_ic_total?: number | null
          cement_board_cp_total?: number | null
          cement_board_ic_total?: number | null
          city?: string | null
          client_email?: string | null
          client_estimate_text?: string | null
          client_name?: string | null
          client_phone?: string | null
          closet_scope_level?: string | null
          closets_cp_total?: number | null
          closets_ic_total?: number | null
          contractor_id: string
          created_at?: string | null
          created_by_profile_id?: string | null
          demo_cp_total?: number | null
          demo_ic_total?: number | null
          final_cp_total?: number | null
          final_ic_total?: number | null
          gc_permit_cp_total?: number | null
          gc_permit_ic_total?: number | null
          glass_cp_total?: number | null
          glass_ic_total?: number | null
          glass_type?: string | null
          has_bathrooms?: boolean | null
          has_closets?: boolean | null
          has_kitchen?: boolean | null
          high_estimate_cp?: number | null
          id?: string
          include_demo?: boolean | null
          include_electrical?: boolean | null
          include_glass?: boolean | null
          include_management_fee?: boolean | null
          include_paint?: boolean | null
          include_plumbing?: boolean | null
          include_waterproofing?: boolean | null
          internal_json_payload?: Json | null
          job_label?: string | null
          job_notes?: string | null
          kitchen_cabinet_supplier_cost_ic?: number | null
          kitchen_countertop_sqft?: number | null
          kitchen_cp_total?: number | null
          kitchen_ic_total?: number | null
          kitchen_scope_level?: string | null
          kitchen_uses_tkbso_cabinets?: boolean | null
          lighting_cp_total?: number | null
          lighting_ic_total?: number | null
          low_estimate_cp?: number | null
          management_fee_cp?: number | null
          management_fee_ic?: number | null
          management_fee_percent?: number | null
          needs_gc_partner?: boolean | null
          num_bathrooms?: number | null
          num_closets?: number | null
          num_kitchens?: number | null
          num_recessed_cans?: number | null
          num_toilets?: number | null
          num_vanity_lights?: number | null
          other_cp_total?: number | null
          other_ic_total?: number | null
          paint_cp_total?: number | null
          paint_ic_total?: number | null
          permit_required?: boolean | null
          plumbing_cp_total?: number | null
          plumbing_ic_total?: number | null
          property_address?: string | null
          quartz_cp_total?: number | null
          quartz_ic_total?: number | null
          state?: string | null
          status?: string | null
          subtotal_cp_before_min_job?: number | null
          subtotal_ic_before_min_job?: number | null
          tile_cp_total?: number | null
          tile_ic_total?: number | null
          total_bathroom_sqft?: number | null
          total_closet_sqft?: number | null
          total_kitchen_sqft?: number | null
          updated_at?: string | null
          vanities_cp_total?: number | null
          vanities_ic_total?: number | null
          vanity_size?: string | null
          waterproofing_cp_total?: number | null
          waterproofing_ic_total?: number | null
          zip?: string | null
        }
        Update: {
          bath_countertop_sqft?: number | null
          bath_floor_tile_sqft?: number | null
          bath_frameless_glass_sqft?: number | null
          bath_scope_level?: string | null
          bath_shower_floor_tile_sqft?: number | null
          bath_shower_only_sqft?: number | null
          bath_uses_frameless_glass?: boolean | null
          bath_uses_tkbso_vanities?: boolean | null
          bath_vanity_supplier_cost_ic?: number | null
          bath_wall_tile_sqft?: number | null
          baths_cp_total?: number | null
          baths_ic_total?: number | null
          cabinets_cp_total?: number | null
          cabinets_ic_total?: number | null
          cement_board_cp_total?: number | null
          cement_board_ic_total?: number | null
          city?: string | null
          client_email?: string | null
          client_estimate_text?: string | null
          client_name?: string | null
          client_phone?: string | null
          closet_scope_level?: string | null
          closets_cp_total?: number | null
          closets_ic_total?: number | null
          contractor_id?: string
          created_at?: string | null
          created_by_profile_id?: string | null
          demo_cp_total?: number | null
          demo_ic_total?: number | null
          final_cp_total?: number | null
          final_ic_total?: number | null
          gc_permit_cp_total?: number | null
          gc_permit_ic_total?: number | null
          glass_cp_total?: number | null
          glass_ic_total?: number | null
          glass_type?: string | null
          has_bathrooms?: boolean | null
          has_closets?: boolean | null
          has_kitchen?: boolean | null
          high_estimate_cp?: number | null
          id?: string
          include_demo?: boolean | null
          include_electrical?: boolean | null
          include_glass?: boolean | null
          include_management_fee?: boolean | null
          include_paint?: boolean | null
          include_plumbing?: boolean | null
          include_waterproofing?: boolean | null
          internal_json_payload?: Json | null
          job_label?: string | null
          job_notes?: string | null
          kitchen_cabinet_supplier_cost_ic?: number | null
          kitchen_countertop_sqft?: number | null
          kitchen_cp_total?: number | null
          kitchen_ic_total?: number | null
          kitchen_scope_level?: string | null
          kitchen_uses_tkbso_cabinets?: boolean | null
          lighting_cp_total?: number | null
          lighting_ic_total?: number | null
          low_estimate_cp?: number | null
          management_fee_cp?: number | null
          management_fee_ic?: number | null
          management_fee_percent?: number | null
          needs_gc_partner?: boolean | null
          num_bathrooms?: number | null
          num_closets?: number | null
          num_kitchens?: number | null
          num_recessed_cans?: number | null
          num_toilets?: number | null
          num_vanity_lights?: number | null
          other_cp_total?: number | null
          other_ic_total?: number | null
          paint_cp_total?: number | null
          paint_ic_total?: number | null
          permit_required?: boolean | null
          plumbing_cp_total?: number | null
          plumbing_ic_total?: number | null
          property_address?: string | null
          quartz_cp_total?: number | null
          quartz_ic_total?: number | null
          state?: string | null
          status?: string | null
          subtotal_cp_before_min_job?: number | null
          subtotal_ic_before_min_job?: number | null
          tile_cp_total?: number | null
          tile_ic_total?: number | null
          total_bathroom_sqft?: number | null
          total_closet_sqft?: number | null
          total_kitchen_sqft?: number | null
          updated_at?: string | null
          vanities_cp_total?: number | null
          vanities_ic_total?: number | null
          vanity_size?: string | null
          waterproofing_cp_total?: number | null
          waterproofing_ic_total?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_configs: {
        Row: {
          alcove_builtin_cp: number | null
          alcove_builtin_ic: number | null
          barrier_cp_per_sqft: number | null
          barrier_ic_per_sqft: number | null
          bath_cp_per_sqft: number | null
          bath_ic_per_sqft: number | null
          bath_partial_multiplier: number | null
          bath_refresh_multiplier: number | null
          bath_shower_only_multiplier: number | null
          bathroom_target_margin: number | null
          cabinet_install_only_lf_cp: number | null
          cabinet_install_only_lf_ic: number | null
          cabinet_lf_cp: number | null
          cabinet_lf_ic: number | null
          cabinet_markup_multiplier_no_gc: number | null
          cabinet_markup_multiplier_with_gc: number | null
          cement_board_cp_per_sqft: number | null
          cement_board_ic_per_sqft: number | null
          closet_cp_per_sqft: number | null
          closet_ic_per_sqft: number | null
          closet_reframe_cp: number | null
          closet_reframe_ic: number | null
          contractor_id: string
          created_at: string | null
          currency: string | null
          demo_haul_margin: number | null
          demo_kitchen_cp: number | null
          demo_kitchen_ic: number | null
          demo_large_bath_cp: number | null
          demo_large_bath_ic: number | null
          demo_shower_only_cp: number | null
          demo_shower_only_ic: number | null
          demo_small_bath_cp: number | null
          demo_small_bath_ic: number | null
          door_closure_cp: number | null
          door_closure_ic: number | null
          door_relocation_cp: number | null
          door_relocation_ic: number | null
          drywall_cp_per_sqft: number | null
          drywall_ic_per_sqft: number | null
          dumpster_bath_cp: number | null
          dumpster_bath_ic: number | null
          dumpster_kitchen_cp: number | null
          dumpster_kitchen_ic: number | null
          electrical_dishwasher_disposal_cp: number | null
          electrical_hood_relocation_cp: number | null
          electrical_kitchen_package_cp: number | null
          electrical_kitchen_package_ic: number | null
          electrical_margin: number | null
          electrical_microwave_circuit_cp: number | null
          electrical_small_package_cp: number | null
          electrical_small_package_ic: number | null
          electrical_vanity_light_cp: number | null
          electrical_vanity_light_ic: number | null
          entrance_enlargement_cp: number | null
          entrance_enlargement_ic: number | null
          floor_leveling_bath_cp: number | null
          floor_leveling_bath_ic: number | null
          floor_leveling_kitchen_cp: number | null
          floor_leveling_kitchen_ic: number | null
          floor_leveling_ls_cp: number | null
          floor_leveling_ls_ic: number | null
          floor_leveling_small_cp: number | null
          floor_leveling_small_ic: number | null
          frameless_glass_cp_per_sqft: number | null
          frameless_glass_ic_per_sqft: number | null
          framing_margin: number | null
          framing_pony_wall_cp: number | null
          framing_pony_wall_ic: number | null
          framing_standard_cp: number | null
          framing_standard_ic: number | null
          freestanding_tub_allowance_cp: number | null
          garbage_disposal_allowance_cp: number | null
          gc_permit_fee_cp: number | null
          gc_permit_fee_ic: number | null
          glass_90_return_cp: number | null
          glass_90_return_ic: number | null
          glass_panel_only_cp: number | null
          glass_panel_only_ic: number | null
          glass_shower_standard_cp: number | null
          glass_shower_standard_ic: number | null
          hardware_allowance_per_pull_cp: number | null
          high_range_multiplier: number | null
          id: string
          kitchen_cp_per_sqft: number | null
          kitchen_faucet_allowance_cp: number | null
          kitchen_ic_per_sqft: number | null
          kitchen_partial_multiplier: number | null
          kitchen_refresh_multiplier: number | null
          kitchen_target_margin: number | null
          lighting_fixture_allowance_cp: number | null
          low_range_multiplier: number | null
          lvp_cp_per_sqft: number | null
          lvp_ic_per_sqft: number | null
          management_fee_percent: number | null
          min_job_cp: number | null
          min_job_ic: number | null
          mirror_allowance_cp: number | null
          mirror_lighting_allowance_cp: number | null
          niche_cp_each: number | null
          niche_ic_each: number | null
          paint_full_bath_cp: number | null
          paint_full_bath_ic: number | null
          paint_patch_bath_cp: number | null
          paint_patch_bath_ic: number | null
          payment_split_deposit: number | null
          payment_split_final: number | null
          payment_split_progress: number | null
          plumbing_extra_head_cp: number | null
          plumbing_extra_head_ic: number | null
          plumbing_fixture_allowance_cp: number | null
          plumbing_linear_drain_cp: number | null
          plumbing_linear_drain_ic: number | null
          plumbing_shower_standard_cp: number | null
          plumbing_shower_standard_ic: number | null
          plumbing_smart_valve_cp: number | null
          plumbing_smart_valve_ic: number | null
          plumbing_standard_margin: number | null
          plumbing_toilet_cp: number | null
          plumbing_toilet_ic: number | null
          plumbing_toilet_relocation_cp: number | null
          plumbing_tub_freestanding_cp: number | null
          plumbing_tub_freestanding_ic: number | null
          plumbing_tub_to_shower_cp: number | null
          plumbing_tub_to_shower_ic: number | null
          quartz_countertop_margin: number | null
          quartz_cp_per_sqft: number | null
          quartz_faucet_drill_cp: number | null
          quartz_ic_per_sqft: number | null
          quartz_sink_cutout_cp: number | null
          quartz_slab_level1_allowance_cp: number | null
          recessed_can_cp_each: number | null
          recessed_can_ic_each: number | null
          regular_tub_allowance_cp: number | null
          shower_enlargement_cp: number | null
          shower_enlargement_ic: number | null
          shower_trim_kit_allowance_cp: number | null
          sink_faucet_allowance_cp: number | null
          soffit_removal_cp: number | null
          soffit_removal_ic: number | null
          target_margin: number | null
          tile_floor_cp_per_sqft: number | null
          tile_floor_ic_per_sqft: number | null
          tile_material_allowance_cp_per_sqft: number | null
          tile_shower_floor_cp_per_sqft: number | null
          tile_shower_floor_ic_per_sqft: number | null
          tile_wall_cp_per_sqft: number | null
          tile_wall_ic_per_sqft: number | null
          toilet_allowance_cp: number | null
          toilet_relocation_cp: number | null
          toilet_relocation_ic: number | null
          tub_allowance_cp: number | null
          tub_filler_allowance_cp: number | null
          tub_relocation_cp: number | null
          tub_relocation_ic: number | null
          updated_at: string | null
          vanity_30_bundle_cp: number | null
          vanity_30_bundle_ic: number | null
          vanity_36_bundle_cp: number | null
          vanity_36_bundle_ic: number | null
          vanity_48_bundle_cp: number | null
          vanity_48_bundle_ic: number | null
          vanity_54_bundle_cp: number | null
          vanity_54_bundle_ic: number | null
          vanity_60_bundle_cp: number | null
          vanity_60_bundle_ic: number | null
          vanity_72_bundle_cp: number | null
          vanity_72_bundle_ic: number | null
          vanity_84_bundle_cp: number | null
          vanity_84_bundle_ic: number | null
          vanity_only_48_cp: number | null
          wall_removal_cp: number | null
          wall_removal_ic: number | null
          wall_tile_labor_margin: number | null
          waterproofing_cp_per_sqft: number | null
          waterproofing_ic_per_sqft: number | null
          waterproofing_margin: number | null
        }
        Insert: {
          alcove_builtin_cp?: number | null
          alcove_builtin_ic?: number | null
          barrier_cp_per_sqft?: number | null
          barrier_ic_per_sqft?: number | null
          bath_cp_per_sqft?: number | null
          bath_ic_per_sqft?: number | null
          bath_partial_multiplier?: number | null
          bath_refresh_multiplier?: number | null
          bath_shower_only_multiplier?: number | null
          bathroom_target_margin?: number | null
          cabinet_install_only_lf_cp?: number | null
          cabinet_install_only_lf_ic?: number | null
          cabinet_lf_cp?: number | null
          cabinet_lf_ic?: number | null
          cabinet_markup_multiplier_no_gc?: number | null
          cabinet_markup_multiplier_with_gc?: number | null
          cement_board_cp_per_sqft?: number | null
          cement_board_ic_per_sqft?: number | null
          closet_cp_per_sqft?: number | null
          closet_ic_per_sqft?: number | null
          closet_reframe_cp?: number | null
          closet_reframe_ic?: number | null
          contractor_id: string
          created_at?: string | null
          currency?: string | null
          demo_haul_margin?: number | null
          demo_kitchen_cp?: number | null
          demo_kitchen_ic?: number | null
          demo_large_bath_cp?: number | null
          demo_large_bath_ic?: number | null
          demo_shower_only_cp?: number | null
          demo_shower_only_ic?: number | null
          demo_small_bath_cp?: number | null
          demo_small_bath_ic?: number | null
          door_closure_cp?: number | null
          door_closure_ic?: number | null
          door_relocation_cp?: number | null
          door_relocation_ic?: number | null
          drywall_cp_per_sqft?: number | null
          drywall_ic_per_sqft?: number | null
          dumpster_bath_cp?: number | null
          dumpster_bath_ic?: number | null
          dumpster_kitchen_cp?: number | null
          dumpster_kitchen_ic?: number | null
          electrical_dishwasher_disposal_cp?: number | null
          electrical_hood_relocation_cp?: number | null
          electrical_kitchen_package_cp?: number | null
          electrical_kitchen_package_ic?: number | null
          electrical_margin?: number | null
          electrical_microwave_circuit_cp?: number | null
          electrical_small_package_cp?: number | null
          electrical_small_package_ic?: number | null
          electrical_vanity_light_cp?: number | null
          electrical_vanity_light_ic?: number | null
          entrance_enlargement_cp?: number | null
          entrance_enlargement_ic?: number | null
          floor_leveling_bath_cp?: number | null
          floor_leveling_bath_ic?: number | null
          floor_leveling_kitchen_cp?: number | null
          floor_leveling_kitchen_ic?: number | null
          floor_leveling_ls_cp?: number | null
          floor_leveling_ls_ic?: number | null
          floor_leveling_small_cp?: number | null
          floor_leveling_small_ic?: number | null
          frameless_glass_cp_per_sqft?: number | null
          frameless_glass_ic_per_sqft?: number | null
          framing_margin?: number | null
          framing_pony_wall_cp?: number | null
          framing_pony_wall_ic?: number | null
          framing_standard_cp?: number | null
          framing_standard_ic?: number | null
          freestanding_tub_allowance_cp?: number | null
          garbage_disposal_allowance_cp?: number | null
          gc_permit_fee_cp?: number | null
          gc_permit_fee_ic?: number | null
          glass_90_return_cp?: number | null
          glass_90_return_ic?: number | null
          glass_panel_only_cp?: number | null
          glass_panel_only_ic?: number | null
          glass_shower_standard_cp?: number | null
          glass_shower_standard_ic?: number | null
          hardware_allowance_per_pull_cp?: number | null
          high_range_multiplier?: number | null
          id?: string
          kitchen_cp_per_sqft?: number | null
          kitchen_faucet_allowance_cp?: number | null
          kitchen_ic_per_sqft?: number | null
          kitchen_partial_multiplier?: number | null
          kitchen_refresh_multiplier?: number | null
          kitchen_target_margin?: number | null
          lighting_fixture_allowance_cp?: number | null
          low_range_multiplier?: number | null
          lvp_cp_per_sqft?: number | null
          lvp_ic_per_sqft?: number | null
          management_fee_percent?: number | null
          min_job_cp?: number | null
          min_job_ic?: number | null
          mirror_allowance_cp?: number | null
          mirror_lighting_allowance_cp?: number | null
          niche_cp_each?: number | null
          niche_ic_each?: number | null
          paint_full_bath_cp?: number | null
          paint_full_bath_ic?: number | null
          paint_patch_bath_cp?: number | null
          paint_patch_bath_ic?: number | null
          payment_split_deposit?: number | null
          payment_split_final?: number | null
          payment_split_progress?: number | null
          plumbing_extra_head_cp?: number | null
          plumbing_extra_head_ic?: number | null
          plumbing_fixture_allowance_cp?: number | null
          plumbing_linear_drain_cp?: number | null
          plumbing_linear_drain_ic?: number | null
          plumbing_shower_standard_cp?: number | null
          plumbing_shower_standard_ic?: number | null
          plumbing_smart_valve_cp?: number | null
          plumbing_smart_valve_ic?: number | null
          plumbing_standard_margin?: number | null
          plumbing_toilet_cp?: number | null
          plumbing_toilet_ic?: number | null
          plumbing_toilet_relocation_cp?: number | null
          plumbing_tub_freestanding_cp?: number | null
          plumbing_tub_freestanding_ic?: number | null
          plumbing_tub_to_shower_cp?: number | null
          plumbing_tub_to_shower_ic?: number | null
          quartz_countertop_margin?: number | null
          quartz_cp_per_sqft?: number | null
          quartz_faucet_drill_cp?: number | null
          quartz_ic_per_sqft?: number | null
          quartz_sink_cutout_cp?: number | null
          quartz_slab_level1_allowance_cp?: number | null
          recessed_can_cp_each?: number | null
          recessed_can_ic_each?: number | null
          regular_tub_allowance_cp?: number | null
          shower_enlargement_cp?: number | null
          shower_enlargement_ic?: number | null
          shower_trim_kit_allowance_cp?: number | null
          sink_faucet_allowance_cp?: number | null
          soffit_removal_cp?: number | null
          soffit_removal_ic?: number | null
          target_margin?: number | null
          tile_floor_cp_per_sqft?: number | null
          tile_floor_ic_per_sqft?: number | null
          tile_material_allowance_cp_per_sqft?: number | null
          tile_shower_floor_cp_per_sqft?: number | null
          tile_shower_floor_ic_per_sqft?: number | null
          tile_wall_cp_per_sqft?: number | null
          tile_wall_ic_per_sqft?: number | null
          toilet_allowance_cp?: number | null
          toilet_relocation_cp?: number | null
          toilet_relocation_ic?: number | null
          tub_allowance_cp?: number | null
          tub_filler_allowance_cp?: number | null
          tub_relocation_cp?: number | null
          tub_relocation_ic?: number | null
          updated_at?: string | null
          vanity_30_bundle_cp?: number | null
          vanity_30_bundle_ic?: number | null
          vanity_36_bundle_cp?: number | null
          vanity_36_bundle_ic?: number | null
          vanity_48_bundle_cp?: number | null
          vanity_48_bundle_ic?: number | null
          vanity_54_bundle_cp?: number | null
          vanity_54_bundle_ic?: number | null
          vanity_60_bundle_cp?: number | null
          vanity_60_bundle_ic?: number | null
          vanity_72_bundle_cp?: number | null
          vanity_72_bundle_ic?: number | null
          vanity_84_bundle_cp?: number | null
          vanity_84_bundle_ic?: number | null
          vanity_only_48_cp?: number | null
          wall_removal_cp?: number | null
          wall_removal_ic?: number | null
          wall_tile_labor_margin?: number | null
          waterproofing_cp_per_sqft?: number | null
          waterproofing_ic_per_sqft?: number | null
          waterproofing_margin?: number | null
        }
        Update: {
          alcove_builtin_cp?: number | null
          alcove_builtin_ic?: number | null
          barrier_cp_per_sqft?: number | null
          barrier_ic_per_sqft?: number | null
          bath_cp_per_sqft?: number | null
          bath_ic_per_sqft?: number | null
          bath_partial_multiplier?: number | null
          bath_refresh_multiplier?: number | null
          bath_shower_only_multiplier?: number | null
          bathroom_target_margin?: number | null
          cabinet_install_only_lf_cp?: number | null
          cabinet_install_only_lf_ic?: number | null
          cabinet_lf_cp?: number | null
          cabinet_lf_ic?: number | null
          cabinet_markup_multiplier_no_gc?: number | null
          cabinet_markup_multiplier_with_gc?: number | null
          cement_board_cp_per_sqft?: number | null
          cement_board_ic_per_sqft?: number | null
          closet_cp_per_sqft?: number | null
          closet_ic_per_sqft?: number | null
          closet_reframe_cp?: number | null
          closet_reframe_ic?: number | null
          contractor_id?: string
          created_at?: string | null
          currency?: string | null
          demo_haul_margin?: number | null
          demo_kitchen_cp?: number | null
          demo_kitchen_ic?: number | null
          demo_large_bath_cp?: number | null
          demo_large_bath_ic?: number | null
          demo_shower_only_cp?: number | null
          demo_shower_only_ic?: number | null
          demo_small_bath_cp?: number | null
          demo_small_bath_ic?: number | null
          door_closure_cp?: number | null
          door_closure_ic?: number | null
          door_relocation_cp?: number | null
          door_relocation_ic?: number | null
          drywall_cp_per_sqft?: number | null
          drywall_ic_per_sqft?: number | null
          dumpster_bath_cp?: number | null
          dumpster_bath_ic?: number | null
          dumpster_kitchen_cp?: number | null
          dumpster_kitchen_ic?: number | null
          electrical_dishwasher_disposal_cp?: number | null
          electrical_hood_relocation_cp?: number | null
          electrical_kitchen_package_cp?: number | null
          electrical_kitchen_package_ic?: number | null
          electrical_margin?: number | null
          electrical_microwave_circuit_cp?: number | null
          electrical_small_package_cp?: number | null
          electrical_small_package_ic?: number | null
          electrical_vanity_light_cp?: number | null
          electrical_vanity_light_ic?: number | null
          entrance_enlargement_cp?: number | null
          entrance_enlargement_ic?: number | null
          floor_leveling_bath_cp?: number | null
          floor_leveling_bath_ic?: number | null
          floor_leveling_kitchen_cp?: number | null
          floor_leveling_kitchen_ic?: number | null
          floor_leveling_ls_cp?: number | null
          floor_leveling_ls_ic?: number | null
          floor_leveling_small_cp?: number | null
          floor_leveling_small_ic?: number | null
          frameless_glass_cp_per_sqft?: number | null
          frameless_glass_ic_per_sqft?: number | null
          framing_margin?: number | null
          framing_pony_wall_cp?: number | null
          framing_pony_wall_ic?: number | null
          framing_standard_cp?: number | null
          framing_standard_ic?: number | null
          freestanding_tub_allowance_cp?: number | null
          garbage_disposal_allowance_cp?: number | null
          gc_permit_fee_cp?: number | null
          gc_permit_fee_ic?: number | null
          glass_90_return_cp?: number | null
          glass_90_return_ic?: number | null
          glass_panel_only_cp?: number | null
          glass_panel_only_ic?: number | null
          glass_shower_standard_cp?: number | null
          glass_shower_standard_ic?: number | null
          hardware_allowance_per_pull_cp?: number | null
          high_range_multiplier?: number | null
          id?: string
          kitchen_cp_per_sqft?: number | null
          kitchen_faucet_allowance_cp?: number | null
          kitchen_ic_per_sqft?: number | null
          kitchen_partial_multiplier?: number | null
          kitchen_refresh_multiplier?: number | null
          kitchen_target_margin?: number | null
          lighting_fixture_allowance_cp?: number | null
          low_range_multiplier?: number | null
          lvp_cp_per_sqft?: number | null
          lvp_ic_per_sqft?: number | null
          management_fee_percent?: number | null
          min_job_cp?: number | null
          min_job_ic?: number | null
          mirror_allowance_cp?: number | null
          mirror_lighting_allowance_cp?: number | null
          niche_cp_each?: number | null
          niche_ic_each?: number | null
          paint_full_bath_cp?: number | null
          paint_full_bath_ic?: number | null
          paint_patch_bath_cp?: number | null
          paint_patch_bath_ic?: number | null
          payment_split_deposit?: number | null
          payment_split_final?: number | null
          payment_split_progress?: number | null
          plumbing_extra_head_cp?: number | null
          plumbing_extra_head_ic?: number | null
          plumbing_fixture_allowance_cp?: number | null
          plumbing_linear_drain_cp?: number | null
          plumbing_linear_drain_ic?: number | null
          plumbing_shower_standard_cp?: number | null
          plumbing_shower_standard_ic?: number | null
          plumbing_smart_valve_cp?: number | null
          plumbing_smart_valve_ic?: number | null
          plumbing_standard_margin?: number | null
          plumbing_toilet_cp?: number | null
          plumbing_toilet_ic?: number | null
          plumbing_toilet_relocation_cp?: number | null
          plumbing_tub_freestanding_cp?: number | null
          plumbing_tub_freestanding_ic?: number | null
          plumbing_tub_to_shower_cp?: number | null
          plumbing_tub_to_shower_ic?: number | null
          quartz_countertop_margin?: number | null
          quartz_cp_per_sqft?: number | null
          quartz_faucet_drill_cp?: number | null
          quartz_ic_per_sqft?: number | null
          quartz_sink_cutout_cp?: number | null
          quartz_slab_level1_allowance_cp?: number | null
          recessed_can_cp_each?: number | null
          recessed_can_ic_each?: number | null
          regular_tub_allowance_cp?: number | null
          shower_enlargement_cp?: number | null
          shower_enlargement_ic?: number | null
          shower_trim_kit_allowance_cp?: number | null
          sink_faucet_allowance_cp?: number | null
          soffit_removal_cp?: number | null
          soffit_removal_ic?: number | null
          target_margin?: number | null
          tile_floor_cp_per_sqft?: number | null
          tile_floor_ic_per_sqft?: number | null
          tile_material_allowance_cp_per_sqft?: number | null
          tile_shower_floor_cp_per_sqft?: number | null
          tile_shower_floor_ic_per_sqft?: number | null
          tile_wall_cp_per_sqft?: number | null
          tile_wall_ic_per_sqft?: number | null
          toilet_allowance_cp?: number | null
          toilet_relocation_cp?: number | null
          toilet_relocation_ic?: number | null
          tub_allowance_cp?: number | null
          tub_filler_allowance_cp?: number | null
          tub_relocation_cp?: number | null
          tub_relocation_ic?: number | null
          updated_at?: string | null
          vanity_30_bundle_cp?: number | null
          vanity_30_bundle_ic?: number | null
          vanity_36_bundle_cp?: number | null
          vanity_36_bundle_ic?: number | null
          vanity_48_bundle_cp?: number | null
          vanity_48_bundle_ic?: number | null
          vanity_54_bundle_cp?: number | null
          vanity_54_bundle_ic?: number | null
          vanity_60_bundle_cp?: number | null
          vanity_60_bundle_ic?: number | null
          vanity_72_bundle_cp?: number | null
          vanity_72_bundle_ic?: number | null
          vanity_84_bundle_cp?: number | null
          vanity_84_bundle_ic?: number | null
          vanity_only_48_cp?: number | null
          wall_removal_cp?: number | null
          wall_removal_ic?: number | null
          wall_tile_labor_margin?: number | null
          waterproofing_cp_per_sqft?: number | null
          waterproofing_ic_per_sqft?: number | null
          waterproofing_margin?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_configs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: true
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      product_mappings: {
        Row: {
          contractor_id: string
          created_at: string
          current_price: number
          id: string
          is_active: boolean
          last_synced_at: string | null
          pricing_field: string
          product_description: string | null
          product_name: string
          sku: string
          trade_bucket: string
          updated_at: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          current_price: number
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          pricing_field: string
          product_description?: string | null
          product_name: string
          sku: string
          trade_bucket: string
          updated_at?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          current_price?: number
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          pricing_field?: string
          product_description?: string | null
          product_name?: string
          sku?: string
          trade_bucket?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_mappings_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contractor_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          contractor_id?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          contractor_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      takeoffs: {
        Row: {
          calculated_perimeter: number | null
          calculated_sqft: number | null
          calibration_points: Json | null
          contractor_id: string
          created_at: string
          created_by_profile_id: string | null
          estimate_id: string | null
          id: string
          image_height: number | null
          image_url: string
          image_width: number | null
          notes: string | null
          polygon_coordinates: Json | null
          room_label: string | null
          scale_ratio: number | null
          updated_at: string
        }
        Insert: {
          calculated_perimeter?: number | null
          calculated_sqft?: number | null
          calibration_points?: Json | null
          contractor_id: string
          created_at?: string
          created_by_profile_id?: string | null
          estimate_id?: string | null
          id?: string
          image_height?: number | null
          image_url: string
          image_width?: number | null
          notes?: string | null
          polygon_coordinates?: Json | null
          room_label?: string | null
          scale_ratio?: number | null
          updated_at?: string
        }
        Update: {
          calculated_perimeter?: number | null
          calculated_sqft?: number | null
          calibration_points?: Json | null
          contractor_id?: string
          created_at?: string
          created_by_profile_id?: string | null
          estimate_id?: string | null
          id?: string
          image_height?: number | null
          image_url?: string
          image_width?: number | null
          notes?: string | null
          polygon_coordinates?: Json | null
          room_label?: string | null
          scale_ratio?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "takeoffs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takeoffs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takeoffs_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_buckets_config: {
        Row: {
          category: string
          contractor_id: string
          created_at: string
          description: string | null
          display_name: string
          ic_per_unit: number
          id: string
          is_active: boolean
          margin_percent: number
          trade_name: string
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          contractor_id: string
          created_at?: string
          description?: string | null
          display_name: string
          ic_per_unit?: number
          id?: string
          is_active?: boolean
          margin_percent?: number
          trade_name: string
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          contractor_id?: string
          created_at?: string
          description?: string | null
          display_name?: string
          ic_per_unit?: number
          id?: string
          is_active?: boolean
          margin_percent?: number
          trade_name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_buckets_config_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_contractor_id: { Args: { user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      seed_trade_buckets_for_contractor: {
        Args: { p_contractor_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "contractor_user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "contractor_user"],
    },
  },
} as const
