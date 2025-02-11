import { toast } from "sonner";

interface TimeInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  onBlur: () => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, value, min, max, onChange, onBlur }) => {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        placeholder="00"
        value={value === 0 ? "" : value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || 0;
          if (newValue > max) {
            toast.warning(`${label} cannot be greater than ${max}!`, {
              duration: 1000,
            });
          }
          onChange(Math.min(max, newValue));
        }}
        onBlur={onBlur}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full px-3 py-2 border-2 border-gray-200 rounded-md"
      />
    </div>
  );
};

export default TimeInput;
