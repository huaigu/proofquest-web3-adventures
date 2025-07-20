import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a deterministic gradient based on address hash
export function generateAddressGradient(address: string): string {
  // Simple hash function for the address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Define available gradient combinations
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-purple-500 to-pink-600', 
    'from-pink-500 to-red-600',
    'from-red-500 to-orange-600',
    'from-orange-500 to-yellow-600',
    'from-yellow-500 to-green-600',
    'from-green-500 to-blue-600',
    'from-indigo-500 to-purple-600',
    'from-teal-500 to-cyan-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-rose-500 to-red-600',
    'from-amber-500 to-orange-600',
    'from-lime-500 to-green-600',
    'from-emerald-500 to-teal-600',
    'from-sky-500 to-blue-600',
    'from-slate-500 to-gray-600',
  ];
  
  // Use hash to select gradient
  const gradientIndex = Math.abs(hash) % gradients.length;
  return gradients[gradientIndex];
}

// Generate initials from address (last 2 characters)
export function getAddressInitials(address: string): string {
  return address.slice(-2).toUpperCase();
}
