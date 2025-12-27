import { DirectoryList } from "../../components/DirectoryList";

export default function DirectoryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Directory</h1>
        <p className="text-sm text-textMuted max-w-2xl">
          Browse Web3 professionals vetted by the VCC team. This demo uses mock
          data only, but mirrors how the live directory will work.
        </p>
      </header>
      <DirectoryList />
    </div>
  );
}

