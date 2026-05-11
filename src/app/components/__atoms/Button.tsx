type ButtonProps = {
  text: string;
  onClick: () => void;
};

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full h-[50px] bg-blue-600 text-white rounded-full cursor-pointer"
    >
      {text}
    </button>
  );
}
