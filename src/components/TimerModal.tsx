import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { useTimerStore } from "../store/useTimerStore";
import { validateTimerForm } from "../utils/validation";
import { Timer } from "../types/timer";
import { Button } from "./Buttons";
import { toast, ToasterProps } from "sonner";

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timer?: Timer;
  isEditMode?: boolean;
}

const MOBILE_BREAKPOINT = 768;

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  timer,
  isEditMode,
}) => {

  const [form, setForm] = useState({
    title: "",
    description: "",
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [touched, setTouched] = useState({
    title: false,
    hours: false,
    minutes: false,
    seconds: false,
  });

  const [toastPosition, setToastPosition] =
    useState<ToasterProps["position"]>("top-right");

  const { addTimer, editTimer } = useTimerStore();

  useEffect(() => {
    const handleResize = () => {
      setToastPosition(
        window.innerWidth < MOBILE_BREAKPOINT ? "bottom-center" : "top-right"
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setForm({
        title: timer?.title || "",
        description: timer?.description || "",
        hours: timer ? Math.floor(timer.duration / 3600) : 0,
        minutes: timer ? Math.floor((timer.duration % 3600) / 60) : 0,
        seconds: timer ? timer.duration % 60 : 0,
      });
      setTouched({
        title: false,
        hours: false,
        minutes: false,
        seconds: false,
      });
    }
  }, [isOpen, timer]);

  const handleFieldChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showError = (message: string) => {
    toast.error(message, { position: toastPosition });
  };

  const validateFields = () => {
    const isTitleValid =
      form.title.trim().length > 0 && form.title.length <= 50;
    const isTimeValid = form.hours > 0 || form.minutes > 0 || form.seconds > 0;
    return { isTitleValid, isTimeValid };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { isTitleValid, isTimeValid } = validateFields();
    setTouched({
      title: true,
      hours: true,
      minutes: true,
      seconds: true,
    });

    if (!isTitleValid || !isTimeValid) {
      if (!isTitleValid)
        showError("Please enter a valid title (1-50 characters)");
      if (!isTimeValid) showError("Please set a duration greater than 0");
      return;
    }

    if (!validateTimerForm(form)) {
      showError("Please check all fields and try again");
      return;
    }

    const totalSeconds = form.hours * 3600 + form.minutes * 60 + form.seconds;

    if (isEditMode && timer) {
      editTimer(timer.id, {
        ...form,
        duration: totalSeconds,
      });
    } else {
      addTimer({
        ...form,
        duration: totalSeconds,
        remainingTime: totalSeconds,
        isRunning: false,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const { isTitleValid, isTimeValid } = validateFields();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {isEditMode ? "Edit Timer" : "Add New Timer"}
            </h2>
          </div>
          <Button variant="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              maxLength={50}
              className={`w-full px-3 py-2 border-2 rounded-md ${
                touched.title && !isTitleValid
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
              placeholder="Enter timer title"
            />
            {touched.title && !isTitleValid && (
              <p className="mt-1 text-sm text-red-500">
                Title is required and must be less than 50 characters
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {form.title.length}/50 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md"
              placeholder="Enter timer description (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Duration <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={form.hours}
                  onChange={(e) =>
                    handleFieldChange(
                      "hours",
                      Math.min(23, parseInt(e.target.value) || 0)
                    )
                  }
                  onBlur={() => setTouched({ ...touched, hours: true })}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full px-3 py-2 border-2 border-gray-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={form.minutes}
                  onChange={(e) =>
                    handleFieldChange(
                      "minutes",
                      Math.min(59, parseInt(e.target.value) || 0)
                    )
                  }
                  onBlur={() => setTouched({ ...touched, minutes: true })}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full px-3 py-2 border-2 border-gray-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Seconds
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={form.seconds}
                  onChange={(e) =>
                    handleFieldChange(
                      "seconds",
                      Math.min(59, parseInt(e.target.value) || 0)
                    )
                  }
                  onBlur={() => setTouched({ ...touched, seconds: true })}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full px-3 py-2 border-2 border-gray-200 rounded-md"
                />
              </div>
            </div>
            {touched.hours &&
              touched.minutes &&
              touched.seconds &&
              !isTimeValid && (
                <p className="mt-2 text-sm text-red-500">
                  Please set a duration greater than 0
                </p>
              )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">
              {isEditMode ? "Save Changes" : "Add Timer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
