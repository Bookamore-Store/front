import { useNavigate } from 'react-router-dom';
import { BackButtonSvg } from './BackButtonSvg/BackButtonSvg';

const BackButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        className={`cursor-pointer ${className || ''}`}
      >
        <BackButtonSvg />
      </button>
    </>
  );
};

export default BackButton;
