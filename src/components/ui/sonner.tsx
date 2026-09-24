import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast !rounded-xl !border !border-line !bg-popover !text-ink !shadow-card !font-sans',
          description: '!text-muted-foreground',
          actionButton: '!bg-primary !text-primary-foreground',
          closeButton: '!border-line !bg-popover !text-ink',
        },
      }}
      {...props}
    />
  );
}
