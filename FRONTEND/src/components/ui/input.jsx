import * as React from "react"
const Input = React.forwardRef((props, ref) => {
  const { className, type, ...rest } = props;
  return (
    <input
      type={type}
      className={`flex px-3 py-2 w-full h-10 text-base rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
      ref={ref}
      {...rest}
    />
  );
});
Input.displayName = "Input";

export { Input };
