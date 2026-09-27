import { Link } from 'react-router-dom';
import { LogoSvg } from '../LogoSvg/LogoSvg';

export const AuthHeader = ({ tittle }: { tittle?: string }) => {
  return (
    <header className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-5 px-4 space-y-5">
      <Link to="/">
        <LogoSvg className="text-deep-blue" />
      </Link>
      {tittle && <h2 className="text-h2m text-text-black">{tittle}</h2>}
    </header>
  );
};
