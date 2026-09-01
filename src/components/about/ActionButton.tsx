import Image from "next/image";
import { withBasePath } from "@/lib/basePath";

interface ActionButtonProps {
  href: string;
  text: string;
  backgroundColor: string;
  ariaLabel: string;
  className?: string;
}

export function ActionButton({ 
  href, 
  text, 
  backgroundColor, 
  ariaLabel, 
  className = '' 
}: ActionButtonProps) {
  const imgGroup3 = "/figma/arrow-icon.svg";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="block w-full"
    >
      <div
        className={`relative flex items-center justify-center gap-3.5 py-6 md:py-10 px-4 md:px-8 rounded-[20px] w-full hover:opacity-90 transition-opacity duration-200 border-[1.5px] border-[#333333] ${className}`}
        style={{ backgroundColor }}
      >
        <p className="font-extrabold text-[#ffffff] text-base md:text-4xl leading-none">
          {text}
        </p>
        <div className="rotate-[270deg]">
          <Image
            src={withBasePath(imgGroup3)}
            alt="矢印アイコン"
            width={36}
            height={36}
            className="size-9"
            loading="lazy"
            sizes="36px"
          />
        </div>
      </div>
    </a>
  );
}
