import { logout } from '@/app/store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PowerButtonSvg } from '@/shared/ui/icons/PowerButtonSvg';

const LogOut = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogOut = () => {
    dispatch(logout());
    navigate('/');
  };
  return (
    <>
      <button
        onClick={handleLogOut}
        className="flex gap-2 cursor-pointer text-aquamarine-700 text-h4m hover:underline underline-offset-[5px] decoration-[2px]"
        type="button"
      >
        <PowerButtonSvg />
        {t('auth.logOut')}
      </button>
    </>
  );
};

export default LogOut;
