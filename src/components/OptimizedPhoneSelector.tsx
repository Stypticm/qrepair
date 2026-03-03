import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { BuybackWizard } from './Buyback/BuybackWizard';

interface OptimizedPhoneSelectorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function OptimizedPhoneSelector({ open, onOpenChange }: OptimizedPhoneSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 rounded-[40px] overflow-hidden border-none bg-white shadow-2xl">
        <div className="px-8 pb-8 pt-8">
          <BuybackWizard onComplete={() => onOpenChange?.(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}