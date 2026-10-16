/**
 * Tipos de la base de datos, ESCRITOS A MANO a partir de `supabase/migrations/*.sql`.
 *
 * Lo normal sería generarlos (`supabase gen types typescript --project-id … > types.ts`), y es lo
 * que hay que hacer en cuanto exista el proyecto de Supabase: el fichero generado sustituye a
 * este sin tocar nada más. Mientras tanto, cada cambio en una migración se refleja aquí a mano.
 * El formato imita al generado para que el cambio sea transparente.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Insert: obligatorias las columnas sin default; el resto opcionales. Update: todo opcional. */
/** Las filas son `type` y no `interface` a propósito: una interface no cumple `Record<string, unknown>` y supabase-js tiparía todo como `never`. */
type Insertable<Row, Required extends keyof Row> = Pick<Row, Required> & Partial<Omit<Row, Required>>;

export type Role = "owner" | "staff";
export type BookingStatus = "hold" | "confirmed" | "done" | "cancelled" | "no_show";
export type BookingSource = "web" | "phone" | "walkin" | "panel" | "import";
export type ClientSource = "web" | "panel" | "import";
export type CancelledBy = "client" | "salon" | "system";
export type VoucherKind = "sessions" | "gift";
export type VoucherStatus = "active" | "used" | "expired" | "refunded" | "void";
export type PaymentKind = "booking" | "voucher_sale" | "refund";
export type PaymentMethod = "card" | "cash" | "bizum" | "voucher" | "stripe";
export type NotificationChannel = "email" | "whatsapp";
export type NotificationKind =
  | "confirmation"
  | "reminder"
  | "cancelled"
  | "rescheduled"
  | "voucher"
  | "voucher_expiring";
export type NotificationStatus = "queued" | "sent" | "failed";

export type StaffRow = {
  id: string;
  slug: string;
  name: string;
  color: string;
  bio: string | null;
  specialties: string[];
  instagram: string | null;
  photo_path: string | null;
  active: boolean;
  bookable_online: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export type ProfileRow = {
  id: string;
  role: Role;
  staff_id: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceCategoryRow = {
  id: string;
  slug: string;
  name: string;
  position: number;
}

export type ServiceRow = {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  duration_min: number;
  buffer_min: number;
  price_cents: number;
  price_is_from: boolean;
  active: boolean;
  bookable_online: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export type ServiceStaffRow = {
  service_id: string;
  staff_id: string;
}

export type StaffHoursRow = {
  id: string;
  staff_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export type TimeOffRow = {
  id: string;
  staff_id: string | null;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export type SettingRow = {
  key: string;
  value: Json;
  updated_at: string;
}

export type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  whatsapp_consent: boolean;
  source: ClientSource;
  anonymized_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingRow = {
  id: string;
  client_id: string | null;
  staff_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  expires_at: string | null;
  source: BookingSource;
  any_staff: boolean;
  manage_token: string;
  client_confirmed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: CancelledBy | null;
  cancel_reason: string | null;
  rescheduled_from: string | null;
  total_cents: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingItemRow = {
  id: string;
  booking_id: string;
  service_id: string | null;
  name: string;
  duration_min: number;
  price_cents: number;
  position: number;
}

export type VoucherProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: VoucherKind;
  sessions: number | null;
  service_id: string | null;
  value_cents: number | null;
  price_cents: number;
  validity_months: number | null;
  active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export type VoucherRow = {
  id: string;
  code: string;
  product_id: string | null;
  kind: VoucherKind;
  name: string;
  sessions_total: number | null;
  sessions_left: number | null;
  value_cents: number | null;
  balance_cents: number | null;
  price_cents: number;
  buyer_name: string | null;
  buyer_email: string | null;
  recipient_name: string | null;
  gift_message: string | null;
  purchased_at: string;
  expires_at: string | null;
  status: VoucherStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  sold_in_salon: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type VoucherRedemptionRow = {
  id: string;
  voucher_id: string;
  booking_id: string | null;
  sessions_used: number;
  amount_cents: number;
  redeemed_by: string | null;
  redeemed_at: string;
}

export type PaymentRow = {
  id: string;
  booking_id: string | null;
  voucher_id: string | null;
  kind: PaymentKind;
  method: PaymentMethod;
  amount_cents: number;
  tip_cents: number;
  paid_at: string;
  registered_by: string | null;
  note: string | null;
  created_at: string;
}

export type NotificationRow = {
  id: string;
  booking_id: string | null;
  voucher_id: string | null;
  channel: NotificationChannel;
  kind: NotificationKind;
  status: NotificationStatus;
  attempts: number;
  provider_id: string | null;
  error: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export type AuditLogRow = {
  id: number;
  at: string;
  actor: string | null;
  actor_label: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  before: Json | null;
  after: Json | null;
}

export type VClientRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  source: ClientSource;
  created_at: string;
  anonymized_at: string | null;
  marketing_consent: boolean;
  whatsapp_consent: boolean;
  visits: number;
  visits_12m: number;
  no_shows: number;
  last_visit_at: string | null;
  next_visit_at: string | null;
  spent_cents: number;
  spent_12m_cents: number;
  median_gap_days: number | null;
  favorite_service: string | null;
  usual_staff: string | null;
  tags: string[];
}

export type VVoucherBalanceRow = {
  id: string;
  code: string;
  name: string;
  kind: VoucherKind;
  status: VoucherStatus;
  purchased_at: string;
  expires_at: string | null;
  sessions_total: number | null;
  sessions_left: number | null;
  value_cents: number | null;
  balance_cents: number | null;
  price_cents: number;
  buyer_name: string | null;
  recipient_name: string | null;
  sold_in_salon: boolean;
  consumed_cents: number;
  pending_cents: number;
  expiring_soon: boolean;
}

export type PublicStaffRow = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  specialties: string[];
  instagram: string | null;
  photo_path: string | null;
  bookable_online: boolean;
  position: number;
}

type Rel<Name extends string, Col extends string, Ref extends string> = {
  foreignKeyName: Name;
  columns: [Col];
  isOneToOne: false;
  referencedRelation: Ref;
  referencedColumns: ["id"];
};

export type Database = {
  public: {
    Tables: {
      staff: {
        Row: StaffRow;
        Insert: Insertable<StaffRow, "slug" | "name">;
        Update: Partial<StaffRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Insertable<ProfileRow, "id">;
        Update: Partial<ProfileRow>;
        Relationships: [Rel<"profiles_staff_id_fkey", "staff_id", "staff">];
      };
      service_categories: {
        Row: ServiceCategoryRow;
        Insert: Insertable<ServiceCategoryRow, "slug" | "name">;
        Update: Partial<ServiceCategoryRow>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: Insertable<ServiceRow, "slug" | "name" | "duration_min" | "price_cents">;
        Update: Partial<ServiceRow>;
        Relationships: [Rel<"services_category_id_fkey", "category_id", "service_categories">];
      };
      service_staff: {
        Row: ServiceStaffRow;
        Insert: ServiceStaffRow;
        Update: Partial<ServiceStaffRow>;
        Relationships: [
          Rel<"service_staff_service_id_fkey", "service_id", "services">,
          Rel<"service_staff_staff_id_fkey", "staff_id", "staff">,
        ];
      };
      staff_hours: {
        Row: StaffHoursRow;
        Insert: Insertable<StaffHoursRow, "staff_id" | "weekday" | "start_time" | "end_time">;
        Update: Partial<StaffHoursRow>;
        Relationships: [Rel<"staff_hours_staff_id_fkey", "staff_id", "staff">];
      };
      time_off: {
        Row: TimeOffRow;
        Insert: Insertable<TimeOffRow, "starts_at" | "ends_at">;
        Update: Partial<TimeOffRow>;
        Relationships: [Rel<"time_off_staff_id_fkey", "staff_id", "staff">];
      };
      settings: {
        Row: SettingRow;
        Insert: Insertable<SettingRow, "key" | "value">;
        Update: Partial<SettingRow>;
        Relationships: [];
      };
      clients: {
        Row: ClientRow;
        Insert: Insertable<ClientRow, "name">;
        Update: Partial<ClientRow>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: Insertable<BookingRow, "staff_id" | "starts_at" | "ends_at">;
        Update: Partial<BookingRow>;
        Relationships: [
          Rel<"bookings_client_id_fkey", "client_id", "clients">,
          Rel<"bookings_staff_id_fkey", "staff_id", "staff">,
          Rel<"bookings_rescheduled_from_fkey", "rescheduled_from", "bookings">,
        ];
      };
      booking_items: {
        Row: BookingItemRow;
        Insert: Insertable<BookingItemRow, "booking_id" | "name" | "duration_min" | "price_cents">;
        Update: Partial<BookingItemRow>;
        Relationships: [
          Rel<"booking_items_booking_id_fkey", "booking_id", "bookings">,
          Rel<"booking_items_service_id_fkey", "service_id", "services">,
        ];
      };
      voucher_products: {
        Row: VoucherProductRow;
        Insert: Insertable<VoucherProductRow, "slug" | "name" | "kind" | "price_cents">;
        Update: Partial<VoucherProductRow>;
        Relationships: [Rel<"voucher_products_service_id_fkey", "service_id", "services">];
      };
      vouchers: {
        Row: VoucherRow;
        Insert: Insertable<VoucherRow, "code" | "kind" | "name" | "price_cents">;
        Update: Partial<VoucherRow>;
        Relationships: [Rel<"vouchers_product_id_fkey", "product_id", "voucher_products">];
      };
      voucher_redemptions: {
        Row: VoucherRedemptionRow;
        Insert: Insertable<VoucherRedemptionRow, "voucher_id">;
        Update: Partial<VoucherRedemptionRow>;
        Relationships: [
          Rel<"voucher_redemptions_voucher_id_fkey", "voucher_id", "vouchers">,
          Rel<"voucher_redemptions_booking_id_fkey", "booking_id", "bookings">,
        ];
      };
      payments: {
        Row: PaymentRow;
        Insert: Insertable<PaymentRow, "kind" | "method" | "amount_cents">;
        Update: Partial<PaymentRow>;
        Relationships: [
          Rel<"payments_booking_id_fkey", "booking_id", "bookings">,
          Rel<"payments_voucher_id_fkey", "voucher_id", "vouchers">,
        ];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Insertable<NotificationRow, "channel" | "kind">;
        Update: Partial<NotificationRow>;
        Relationships: [
          Rel<"notifications_booking_id_fkey", "booking_id", "bookings">,
          Rel<"notifications_voucher_id_fkey", "voucher_id", "vouchers">,
        ];
      };
      audit_log: {
        Row: AuditLogRow;
        Insert: Insertable<AuditLogRow, "action" | "entity">;
        Update: Partial<AuditLogRow>;
        Relationships: [];
      };
    };
    Views: {
      v_clients: { Row: VClientRow; Relationships: [] };
      v_voucher_balance: { Row: VVoucherBalanceRow; Relationships: [] };
      public_staff: { Row: PublicStaffRow; Relationships: [] };
    };
    Functions: {
      auth_role: { Args: Record<string, never>; Returns: Role | null };
      auth_staff_id: { Args: Record<string, never>; Returns: string | null };
      setting_int: { Args: { p_key: string; p_default: number }; Returns: number };
      book_slot: {
        Args: {
          p_staff: string;
          p_starts: string;
          p_ends: string;
          p_items: Json;
          p_any_staff?: boolean;
          p_source?: string;
        };
        Returns: string;
      };
      confirm_hold: {
        Args: {
          p_booking: string;
          p_name: string;
          p_phone: string;
          p_email?: string | null;
          p_notes?: string | null;
          p_marketing?: boolean;
        };
        Returns: BookingRow | null;
      };
      reschedule_booking: {
        Args: { p_old: string; p_staff: string; p_starts: string; p_ends: string; p_by?: string };
        Returns: BookingRow;
      };
      redeem_voucher: {
        Args: {
          p_code: string;
          p_sessions?: number;
          p_amount_cents?: number;
          p_booking?: string | null;
          p_actor?: string | null;
        };
        Returns: VoucherRedemptionRow;
      };
      set_actor: { Args: { p_actor: string | null }; Returns: undefined };
      issue_voucher: {
        Args: {
          p_product: string;
          p_code: string;
          p_buyer_name: string | null;
          p_buyer_email: string | null;
          p_recipient_name: string | null;
          p_gift_message: string | null;
          p_stripe_session: string | null;
          p_payment_intent: string | null;
          p_method: PaymentMethod;
          p_sold_in_salon: boolean;
          p_actor: string | null;
        };
        Returns: VoucherRow | null;
      };
      refund_voucher: { Args: { p_payment_intent: string; p_amount: number }; Returns: VoucherRow | null };
      complete_booking_with_voucher: {
        Args: { p_booking: string; p_code: string; p_amount: number; p_tip: number; p_actor: string };
        Returns: VoucherRedemptionRow;
      };
      create_booking: {
        Args: {
          p_client: string | null;
          p_staff: string;
          p_starts: string;
          p_ends: string;
          p_items: Json;
          p_source: BookingSource;
          p_notes: string | null;
          /** null en importaciones y scripts (sin usuario del panel) */
          p_actor: string | null;
        };
        Returns: BookingRow;
      };
      complete_booking: {
        Args: { p_booking: string; p_method: PaymentMethod; p_amount: number; p_tip: number; p_note: string | null; p_actor: string };
        Returns: PaymentRow;
      };
      set_booking_status: {
        Args: { p_booking: string; p_status: BookingStatus; p_by: CancelledBy | null; p_reason: string | null; p_actor: string };
        Returns: BookingRow;
      };
      queue_notification: {
        Args: {
          p_channel: NotificationChannel;
          p_kind: NotificationKind;
          p_booking?: string | null;
          p_voucher?: string | null;
          p_scheduled?: string | null;
        };
        Returns: string | null;
      };
    };
    Enums: {
      booking_status: BookingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

/** Atajos para no escribir Database["public"]["Tables"][…] por todas partes. */
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"];
