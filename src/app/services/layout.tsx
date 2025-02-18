export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <div className="container mx-auto py-32 px-6">{children}</div>
    </div>
  );
}
