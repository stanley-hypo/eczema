import LogForm from "@/components/LogForm";

export default async function LogPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <LogForm date={date} />;
}
