import MultiplayerGameClient from '../../../components/MultiplayerGameClient';


interface MultiplayerGameProps {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ creator?: string }>;
}

export default async function MultiplayerGamePage(props: MultiplayerGameProps) {
  const { gameId } = await props.params;
  const { creator } = await props.searchParams
  const isCreator = creator === 'true';
  
  return (
    <MultiplayerGameClient 
      gameId={gameId}
      isCreator={isCreator}
    />
  );
} 