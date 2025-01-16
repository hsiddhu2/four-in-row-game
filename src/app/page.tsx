import GameBoard from '@/components/GameBoard'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Four in a Row</h1>
      <GameBoard />
    </main>
  )
}
