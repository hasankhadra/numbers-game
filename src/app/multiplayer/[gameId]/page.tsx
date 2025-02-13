import MultiplayerGameClient from '../../../components/MultiplayerGameClient';


interface MultiplayerGameProps {
  params: Promise<{ gameId: string }>;
}

export default async function MultiplayerGamePage(props: MultiplayerGameProps) {
  const { gameId } = await props.params;
  
  return (
    <MultiplayerGameClient 
      gameId={gameId}
    />
  );
} 