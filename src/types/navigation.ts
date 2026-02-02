type Position = { x: number; y: number }

type NavigationContextType = {
  position: Position
  move: (dx: number, dy: number) => void
  goBack: () => void
  setPosition: (p: Position, instant?: boolean) => void
}
