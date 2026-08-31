import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
}

export default function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <p>{statusCode === 404 ? 'Page introuvable' : 'Une erreur est survenue'}</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};
