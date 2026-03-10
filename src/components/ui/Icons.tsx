import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Info,
  Layers,
  Plus,
  Minus,
  Heading,
  Pilcrow,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heart,
  Star,
  GripVertical,
  Users,
  Lock,
  Calendar,
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';

export type IconName = 
  | 'warning'
  | 'check'
  | 'check-circle'
  | 'x-circle'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-left'
  | 'info'
  | 'layers'
  | 'plus'
  | 'minus'
  | 'alert-triangle'
  | 'heading'
  | 'paragraph'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'list-bullet'
  | 'list-numbered'
  | 'heart'
  | 'star'
  | 'grip-vertical'
  | 'users'
  | 'lock'
  | 'calendar'
  | 'quorum'
  | 'eye'
  | 'eye-off';

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

// Mapping des noms d'icônes vers les composants Lucide
const iconMap: Record<IconName, LucideIcon> = {
  'warning': AlertCircle,
  'check': Check,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-left': ArrowLeft,
  'info': Info,
  'layers': Layers,
  'plus': Plus,
  'minus': Minus,
  'alert-triangle': AlertTriangle,
  'heading': Heading,
  'paragraph': Pilcrow,
  'bold': Bold,
  'italic': Italic,
  'underline': Underline,
  'list-bullet': List,
  'list-numbered': ListOrdered,
  'heart': Heart,
  'star': Star,
  'grip-vertical': GripVertical,
  'users': Users,
  'lock': Lock,
  'calendar': Calendar,
  'quorum': Users, // Non utilisé car géré séparément
  'eye': Eye,
  'eye-off': EyeOff,
};

// Composant custom pour l'icône quorum (Users avec un "?")
function QuorumIcon({ size = 20, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={`${size}px`}
      height={`${size}px`}
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="9" cy="7" r="3"/>
      <circle cx="17" cy="7" r="3"/>
      <path d="M5 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <text x="17" y="19" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">?</text>
    </svg>
  );
}

export function Icon({ name, size = 20, strokeWidth = 2 }: IconProps) {
  // Cas spécial pour quorum qui nécessite une icône custom
  if (name === 'quorum') {
    return <QuorumIcon size={size} strokeWidth={strokeWidth} />;
  }

  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent 
      size={size} 
      strokeWidth={strokeWidth}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
}
