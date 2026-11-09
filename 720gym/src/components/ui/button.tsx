import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botón con la API de shadcn/ui (variant, size, asChild), pintado con el sistema de 720:
 * «default» es el botón que vende (.boton-venta), «secondary» el de información (.boton-info),
 * ambos con su animación de flecha y brillo definida en globals.css.
 */
const buttonVariants = cva(
  "subtitular inline-flex items-center justify-center gap-2 whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "boton-venta",
        secondary: "boton-info",
        destructive: "bg-negro text-white hover:bg-pizarra",
        outline: "boton-barrido bg-white text-negro [--barrido:#d9d9db]",
        ghost: "hover:bg-white/10",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-[14px]",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-[52px] px-7 text-[15px]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
