import { FaSpinner } from 'react-icons/fa';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
        <FaSpinner className="animate-spin text-primary text-4xl" />
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;