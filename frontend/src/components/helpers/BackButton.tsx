import { useNavigate } from "react-router-dom";

export const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="text-blue-500 hover:underline mb-4"
    >
      &larr; Back
    </button>
  );
};
