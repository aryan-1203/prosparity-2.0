import {
  Ban, BatteryCharging, BatteryWarning, Building2, CalendarX, Check, Clock, Code, Cpu, CreditCard, Eye, Factory, FileCheck, FileText, Footprints, Gauge, Gavel, Handshake, HeartHandshake, Home, IdCard, IndianRupee, Landmark, Layers, Leaf, Lightbulb, ListChecks, MapPin, Map as MapIcon, MessageSquare, Monitor, Newspaper, Package, PhoneCall, Repeat, Route, Satellite, Scale, Search, ShieldCheck, Smartphone, Sprout, Store, TrendingDown, Truck, User, UserCheck, Users, Wallet, Warehouse, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

const icons = { Ban, BatteryCharging, BatteryWarning, Building2, CalendarX, Check, Clock, Code, Cpu, CreditCard, Eye, Factory, FileCheck, FileText, Footprints, Gauge, Gavel, Handshake, HeartHandshake, Home, IdCard, IndianRupee, Landmark, Layers, Leaf, Lightbulb, ListChecks, MapPin, MapIcon, MessageSquare, Monitor, Newspaper, Package, PhoneCall, Repeat, Route, Satellite, Scale, Search, ShieldCheck, Smartphone, Sprout, Store, TrendingDown, Truck, User, UserCheck, Users, Wallet, Warehouse, Wrench, Zap } satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Glyph = icons[name as IconName] ?? Zap;
  return <Glyph className={className} strokeWidth={1.75} aria-hidden="true" focusable="false" />;
}

/** The icon on a soft green tile, used beside list items. */
export function IconTile({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`flex size-11 shrink-0 items-center justify-center rounded-control bg-mint text-forest ${className}`}>
      <Icon name={name} className="size-[22px]" />
    </span>
  );
}
