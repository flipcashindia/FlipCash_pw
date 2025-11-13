import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, Users, Rocket, Award, X, Upload, 
  CheckCircle, AlertTriangle as AlertTriangleIcon 
} from 'lucide-react';

// --- Types ---
interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
}

interface Perk {
  icon: React.ElementType;
  title: string;
  description: string;
}

// --- Mock Data ---
const companyPerks: Perk[] = [
  {
    icon: Rocket,
    title: "Fast-Paced Growth",
    description: "Be part of a rapidly growing company in the exciting re-commerce industry."
  },
  {
    icon: Users,
    title: "Dynamic Team",
    description: "Work with a diverse, talented, and passionate team that values collaboration."
  },
  {
    icon: Award,
    title: "Competitive Benefits",
    description: "We offer comprehensive health benefits, flexible time off, and team outings."
  },
];

const jobListings: JobPosting[] = [
  {
    id: 'job1',
    title: 'Senior Software Engineer (React)',
    department: 'Engineering',
    location: 'New Delhi, India (Hybrid)',
    description: 'We are looking for a skilled React developer to help build the next generation of our platform.'
  },
  {
    id: 'job2',
    title: 'Digital Marketing Manager',
    department: 'Marketing',
    location: 'Gurgaon, India',
    description: 'Drive our user acquisition strategy and manage our online presence across all channels.'
  },
  {
    id: 'job3',
    title: 'Logistics Coordinator',
    department: 'Operations',
    location: 'Mumbai, India',
    description: 'Manage our device pickup and delivery network to ensure a seamless customer experience.'
  },
  {
    id: 'job4',
    title: 'Customer Support Specialist',
    department: 'Customer Service',
    location: 'New Delhi, India (Remote)',
    description: 'Be the first point of contact for our users, solving problems and providing a world-class experience.'
  },
];

// ==================================================================
// --- START INLINED HELPER COMPONENTS ---
// ==================================================================

// --- Reusable Form Input ---
const FormInput: React.FC<{
  label: string, 
  id: string, 
  type?: string,
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean,
  placeholder?: string
}> = ({ label, id, type = 'text', value, onChange, required = true, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
      required={required}
    />
  </div>
);

// --- Reusable Textarea ---
const FormTextarea: React.FC<{
  label: string,
  id: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  placeholder?: string,
  required?: boolean
}> = ({ label, id, value, onChange, placeholder, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      rows={4}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// --- File Input ---
const FileInput: React.FC<{
  label: string,
  id: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean
}> = ({ label, id, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="file"
      id={id}
      name={id}
      onChange={onChange}
      className="mt-1 block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-teal-50 file:text-teal-700
                 hover:file:bg-teal-100"
      required={required}
      accept=".pdf,.doc,.docx"
    />
    <p className="text-xs text-gray-500 mt-1">PDF or DOC/DOCX only, max 5MB.</p>
  </div>
);

// --- Form Response Alert ---
const FormAlert: React.FC<{
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}> = ({ type, title, message, onClose }) => {
  const Icon = type === 'success' ? CheckCircle : AlertTriangleIcon;
  const colors = type === 'success' 
    ? 'bg-green-50 border-green-300 text-green-800'
    : 'bg-red-50 border-red-300 text-red-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative border ${colors} p-4 rounded-lg`}
    >
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        aria-label="Close"
      >
        <X size={18} />
      </button>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon size={20} className="mt-0.5" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ==================================================================
// --- END INLINED HELPER COMPONENTS ---
// ==================================================================

// --- Reusable Page Header ---
const PageHeader: React.FC<{ title: string; breadcrumbs: { name: string, href: string }[] }> = ({ title, breadcrumbs }) => (
  <div 
    className="py-16 md:py-20" 
    style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
  >
    <div className="container mx-auto px-4 md:px-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        {title}
      </h1>
      <div className="flex justify-center items-center text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.name}>
            {index > 0 && <span className="mx-2">»</span>}
            {crumb.href ? (
              <a href={crumb.href} className="hover:text-red-600 transition-colors">
                {crumb.name}
              </a>
            ) : (
              <span>{crumb.name}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

// --- Perk Card ---
const PerkCard: React.FC<{ perk: Perk }> = ({ perk }) => (
  <div className="bg-white p-6 border rounded-2xl shadow-sm text-center">
    <div className="flex-shrink-0 w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <perk.icon size={32} />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{perk.title}</h3>
    <p className="text-gray-600 text-sm">{perk.description}</p>
  </div>
);

// --- Job Card ---
const JobCard: React.FC<{ job: JobPosting; onApply: () => void }> = ({ job, onApply }) => (
  <motion.div 
    className="bg-white p-6 border rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    whileHover={{ y: -5, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
  >
    <div>
      <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
        <span className="flex items-center gap-1.5">
          <Briefcase size={16} /> {job.department}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={16} /> {job.location}
        </span>
      </div>
      <p className="text-gray-700 mt-3 text-sm">{job.description}</p>
    </div>
    <button
      onClick={onApply}
      className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md flex-shrink-0"
    >
      Apply Now
    </button>
  </motion.div>
);

// --- Application Modal ---
const ApplicationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
}> = ({ isOpen, onClose, jobTitle }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [resume, setResume] = useState<File | null>(null);
  const [formResponse, setFormResponse] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Submitting application for:", jobTitle);
    console.log("Data:", formData);
    console.log("Resume:", resume ? resume.name : 'No file');

    // Show success message
    setFormResponse({
      type: 'success',
      title: 'Application Sent!',
      message: `Your application for ${jobTitle} has been received. We'll be in touch soon!`
    });
    
    // Clear form
    setFormData({ fullName: '', email: '', phone: '', coverLetter: '' });
    setResume(null);
    // Note: In a real app, you might not clear the form, just close the modal.
    // I'll close the modal after 3 seconds.
    setTimeout(() => {
      onClose();
      setFormResponse(null);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Apply Now</h3>
                <p className="text-gray-600">Applying for: {jobTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <AnimatePresence>
                {formResponse && (
                  <div className="mb-6">
                    <FormAlert 
                      {...formResponse} 
                      onClose={() => setFormResponse(null)} 
                    />
                  </div>
                )}
              </AnimatePresence>

              {!formResponse && (
                <div className="space-y-6">
                  <FormInput 
                    label="Full Name" 
                    id="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    placeholder="Rohan" 
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                      label="Email" 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange}
                      placeholder="rohan@example.com"
                    />
                    <FormInput 
                      label="Phone" 
                      id="phone" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <FileInput 
                    label="Upload Resume"
                    id="resume"
                    onChange={handleFileChange}
                  />
                  <FormTextarea
                    label="Cover Letter (Optional)"
                    id="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    placeholder="Tell us why you're a great fit for this role..."
                    required={false}
                  />
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- Main Career Page Component ---
const CareerPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');

  const openApplyModal = (title: string) => {
    setSelectedJobTitle(title);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="bg-white">
        <PageHeader 
          title="Careers"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Careers', href: '' }
          ]}
        />
        
        {/* "Why Join Us" Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Why Join Flipcash?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {companyPerks.map(perk => (
                <PerkCard key={perk.title} perk={perk} />
              ))}
            </div>
          </div>
        </div>

        {/* "Open Positions" Section */}
        <div className="container mx-auto px-4 md:px-6 py-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Open Positions
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {jobListings.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onApply={() => openApplyModal(job.title)} 
              />
            ))}
          </div>
        </div>
      </section>

      <ApplicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobTitle={selectedJobTitle}
      />
    </>
  );
};

export default CareerPage;
