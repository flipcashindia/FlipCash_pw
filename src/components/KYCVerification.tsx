import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  CheckCircle,
  FileImage,
  Banknote,
  Eye,
  Loader2,
} from "lucide-react";

// --- Types ---
type KYCSep = "details" | "aadhar" | "pan" | "bank" | "preview" | "submitted";

// --- Reusable Input (Focus Color Changed) ---
const KYCInput: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  required?: boolean;
}> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  maxLength,
  required = true,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      // --- [COLOR CHANGE] ---
      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      required={required}
    />
  </div>
);

// --- Reusable File Input (Focus Color Changed) ---
const FileInput: React.FC<{
  label: string;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
}> = ({ label, id, onChange, fileName }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
      <span className="text-red-500">*</span>
    </label>
    <label
      htmlFor={id}
      // --- [COLOR CHANGE] ---
      className="w-full flex items-center px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer bg-white"
    >
      <FileImage size={20} className="mr-3 text-gray-500" />
      <span className="text-gray-700">
        {fileName || "Click to upload image"}
      </span>
    </label>
    <input
      type="file"
      id={id}
      name={id}
      accept="image/png, image/jpeg"
      onChange={onChange}
      className="hidden"
      required
    />
  </div>
);

// --- Animation Variants (No Change) ---
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// --- Stepper Component (No Change from last version) ---
const KYCIcons: React.FC<{ currentStep: KYCSep }> = ({ currentStep }) => {
  const steps = [
    { id: "details", icon: User, name: "Details" },
    { id: "aadhar", icon: FileImage, name: "Aadhar" },
    { id: "pan", icon: FileImage, name: "PAN" },
    { id: "bank", icon: Banknote, name: "Bank" },
    { id: "preview", icon: Eye, name: "Preview" },
  ] as const;

  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex justify-between items-center mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                idx <= currentIdx
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <step.icon size={24} />
            </div>
            <span
              className={`mt-2 text-xs font-semibold ${
                idx <= currentIdx ? "text-teal-500" : "text-gray-500"
              }`}
            >
              {step.name}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 rounded ${
                idx < currentIdx ? "bg-teal-500" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Main KYC Component ---
interface KYCVerificationProps {
  partnerData: {
    name: string;
    email: string;
    mobile: string;
  };
  onKycComplete: () => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({
  partnerData,
  onKycComplete,
}) => {
  const [step, setStep] = useState<KYCSep>("details");
  const [direction, setDirection] = useState(1);

  // --- Form State (No Change) ---
  const [details, setDetails] = useState({
    name: partnerData.name,
    email: partnerData.email,
    mobile: partnerData.mobile,
    dob: "",
    gender: "",
  });
  const [aadhar, setAadhar] = useState({
    number: "",
    front: null as File | null,
    back: null as File | null,
  });
  const [pan, setPan] = useState({
    number: "",
    photo: null as File | null,
  });
  const [bank, setBank] = useState({
    bankName: "",
    holderName: "",
    accountNumber: "",
    ifsc: "",
    upi: "",
  });

  // --- Handlers (No Change) ---
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhar((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPan((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBank((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<any>>,
    field: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter((prev: any) => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const nextStep = (next: KYCSep) => {
    setDirection(1);
    setStep(next);
  };
  const prevStep = (prev: KYCSep) => {
    setDirection(-1);
    setStep(prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting KYC Data:", { details, aadhar, pan, bank });
    // Simulate API call
    setTimeout(() => {
      nextStep("submitted");
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white p-8 md:p-12 shadow-xl rounded-lg">
          {step === "submitted" ? (
            // --- Step 7: Submitted Page (No Change from last version) ---
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-12"
            >
              <CheckCircle size={80} className="text-teal-500" />
              <h2 className="text-3xl font-bold mt-6 mb-2">
                Verification Submitted
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your documents are under verification. This usually takes
                24-48 hours. We'll notify you via email.
              </p>
              <Link
                to="/"
                className="inline-flex items-center bg-teal-500 text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
              >
                Go Back to Home
              </Link>
            </motion.div>
          ) : (
            <>
              {/* --- Headings (No Change from last version) --- */}
              <div className="text-center mb-10 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Partner KYC Verification
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Please complete all steps to activate your partner account.
                </p>
              </div>

              <KYCIcons currentStep={step} />
              <AnimatePresence mode="wait" custom={direction}>
                {/* --- Step 1: Partner Details (Select Focus Color Changed) --- */}
                {step === "details" && (
                  <motion.form
                    key="details"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      nextStep("aadhar");
                    }}
                    className="space-y-4"
                  >
                    <KYCInput
                      label="Full Name"
                      id="name"
                      value={details.name}
                      onChange={handleDetailsChange}
                    />
                    <KYCInput
                      label="Email"
                      id="email"
                      value={details.email}
                      onChange={handleDetailsChange}
                    />
                    <KYCInput
                      label="Mobile Number"
                      id="mobile"
                      value={details.mobile}
                      onChange={handleDetailsChange}
                    />
                    <KYCInput
                      label="Date of Birth"
                      id="dob"
                      type="date"
                      value={details.dob}
                      onChange={handleDetailsChange}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender<span className="text-red-500">*</span>
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={details.gender}
                        onChange={(e) =>
                          setDetails({ ...details, gender: e.target.value })
                        }
                        // --- [COLOR CHANGE] ---
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                        required
                      >
                        <option value="" disabled>
                          -- Select --
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        className="bg-teal-500 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* --- Step 2: Aadhar (No Change from last version) --- */}
                {step === "aadhar" && (
                  <motion.form
                    key="aadhar"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      nextStep("pan");
                    }}
                    className="space-y-4"
                  >
                    <KYCInput
                      label="Aadhar Number"
                      id="number"
                      value={aadhar.number}
                      onChange={handleAadharChange}
                      maxLength={12}
                    />
                    <FileInput
                      label="Aadhar Front Side"
                      id="aadhar-front"
                      onChange={(e) =>
                        handleFileChange(e, setAadhar, "front")
                      }
                      fileName={aadhar.front?.name || null}
                    />
                    <FileInput
                      label="Aadhar Back Side"
                      id="aadhar-back"
                      onChange={(e) => handleFileChange(e, setAadhar, "back")}
                      fileName={aadhar.back?.name || null}
                    />
                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={() => prevStep("details")}
                        className="bg-gray-200 text-black py-3 px-8 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-teal-500 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* --- Step 3: PAN (No Change from last version) --- */}
                {step === "pan" && (
                  <motion.form
                    key="pan"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      nextStep("bank");
                    }}
                    className="space-y-4"
                  >
                    <KYCInput
                      label="PAN Number"
                      id="number"
                      value={pan.number}
                      onChange={handlePanChange}
                      maxLength={10}
                    />
                    <FileInput
                      label="PAN Card Photo"
                      id="pan-photo"
                      onChange={(e) => handleFileChange(e, setPan, "photo")}
                      fileName={pan.photo?.name || null}
                    />
                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={() => prevStep("aadhar")}
                        className="bg-gray-200 text-black py-3 px-8 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-teal-500 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* --- Step 4: Bank Details (No Change from last version) --- */}
                {step === "bank" && (
                  <motion.form
                    key="bank"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      nextStep("preview");
                    }}
                    className="space-y-4"
                  >
                    <KYCInput
                      label="Bank Name"
                      id="bankName"
                      value={bank.bankName}
                      onChange={handleBankChange}
                    />
                    <KYCInput
                      label="Account Holder Name"
                      id="holderName"
                      value={bank.holderName}
                      onChange={handleBankChange}
                    />
                    <KYCInput
                      label="Account Number"
                      id="accountNumber"
                      value={bank.accountNumber}
                      onChange={handleBankChange}
                    />
                    <KYCInput
                      label="IFSC Code"
                      id="ifsc"
                      value={bank.ifsc}
                      onChange={handleBankChange}
                    />
                    <KYCInput
                      label="UPI ID"
                      id="upi"
                      value={bank.upi}
                      onChange={handleBankChange}
                      required={false}
                    />
                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={() => prevStep("pan")}
                        className="bg-gray-200 text-black py-3 px-8 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-teal-500 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* --- Step 5: Preview (No Change from last version) --- */}
                {step === "preview" && (
                  <motion.div
                    key="preview"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      {/* Helper to render preview data */}
                      <PreviewItem label="Full Name" value={details.name} />
                      <PreviewItem label="Email" value={details.email} />
                      <PreviewItem label="Mobile" value={details.mobile} />
                      <PreviewItem label="DOB" value={details.dob} />
                      <PreviewItem label="Gender" value={details.gender} />
                      <hr />
                      <PreviewItem label="Aadhar No." value={aadhar.number} />
                      <PreviewItem
                        label="Aadhar Front"
                        value={aadhar.front?.name}
                      />
                      <PreviewItem
                        label="Aadhar Back"
                        value={aadhar.back?.name}
                      />
                      <hr />
                      <PreviewItem label="PAN No." value={pan.number} />
                      <PreviewItem
                        label="PAN Photo"
                        value={pan.photo?.name}
                      />
                      <hr />
                      <PreviewItem label="Bank Name" value={bank.bankName} />
                      <PreviewItem
                        label="Holder Name"
                        value={bank.holderName}
                      />
                      <PreviewItem
                        label="Account No."
                        value={bank.accountNumber}
                      />
                      <PreviewItem label="IFSC" value={bank.ifsc} />
                      <PreviewItem label="UPI ID" value={bank.upi || "N/A"} />
                    </div>

                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={() => prevStep("bank")}
                        className="bg-gray-200 text-black py-3 px-8 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-teal-500 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-600 transition-colors"
                      >
                        Submit for Verification
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PreviewItem (No Change) ---
const PreviewItem: React.FC<{ label: string; value: string | undefined }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}:</span>
    <span className="font-semibold text-black">{value || "Not provided"}</span>
  </div>
);

export default KYCVerification;