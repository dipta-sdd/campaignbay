import { FC } from 'react';

const Required: FC = () => {
  return (
    <span
      className="wpab-required"
      style={{
        background: 'transparent',
        color: '#ff0000',
      }}
    >
      *
    </span>
  );
};

export default Required;