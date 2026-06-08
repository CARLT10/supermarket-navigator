import { type GraphNode } from '../data/graph';

export interface NavigationInstruction {
  text: string;
  distance: number;
  icon: 'straight' | 'left' | 'right' | 'arrival' | 'departure';
}

export function generateDirections(path: GraphNode[], destinationName: string): NavigationInstruction[] {
  if (path.length < 2) {
    return [
      {
        text: 'You are at your destination.',
        distance: 0,
        icon: 'arrival',
      },
    ];
  }

  const instructions: NavigationInstruction[] = [];
  
  // Step 1: Starting instruction
  instructions.push({
    text: `Start at ${path[0].name}.`,
    distance: 0,
    icon: 'departure',
  });

  let currentHeading = -Math.PI / 2; // Facing "North" / straight in (negative Z) by default at entrance
  
  for (let i = 0; i < path.length - 1; i++) {
    const nodeA = path[i];
    const nodeB = path[i + 1];
    
    const dx = nodeB.x - nodeA.x;
    const dz = nodeB.z - nodeA.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx); // in radians

    // Calculate turn direction if it's not the first movement, or compare to default entrance heading
    let turn: 'straight' | 'left' | 'right' = 'straight';
    
    if (i > 0) {
      const prevNode = path[i - 1];
      const prevDx = nodeA.x - prevNode.x;
      const prevDz = nodeA.z - prevNode.z;
      const prevAngle = Math.atan2(prevDz, prevDx);
      
      let angleDiff = angle - prevAngle;
      // Normalize to -PI to PI
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      if (angleDiff < -0.4) {
        turn = 'left';
      } else if (angleDiff > 0.4) {
        turn = 'right';
      }
    } else {
      // First step from entrance heading (facing straight in, which is -Z, angle = -Math.PI / 2)
      let angleDiff = angle - currentHeading;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      if (angleDiff < -0.4) {
        turn = 'left';
      } else if (angleDiff > 0.4) {
        turn = 'right';
      }
    }

    const readableDistance = Math.max(
  1,
  Math.round(distance)
);
    let stepText = '';

    if (turn === 'left') {
      stepText = `Turn Left onto ${nodeB.name} and proceed for ${readableDistance}m.`;
    } else if (turn === 'right') {
      stepText = `Turn Right onto ${nodeB.name} and proceed for ${readableDistance}m.`;
    } else {
      stepText = `Proceed straight towards ${nodeB.name} for ${readableDistance}m.`;
    }

    instructions.push({
      text: stepText,
      distance: readableDistance,
      icon: turn,
    });
  }

  // Step 3: Arrival instruction
  instructions.push({
    text: `You have reached ${destinationName}.`,
    distance: 0,
    icon: 'arrival',
  });

  // Optimize instructions: merge consecutive straight steps if they make sense
  const optimized: NavigationInstruction[] = [];
  
  for (let i = 0; i < instructions.length; i++) {
    const curr = instructions[i];
    if (curr.icon === 'straight' && optimized.length > 0) {
      const prev = optimized[optimized.length - 1];
      if (prev.icon === 'straight') {
        // Merge them
        prev.distance += curr.distance;
        // Extract destination name from the current instruction
        const parts = curr.text.split('towards ');
        const destName = parts.length > 1 ? parts[1].split(' for ')[0] : 'your path';
        prev.text = `Proceed straight towards ${destName} for ${prev.distance}m.`;
        continue;
      }
    }
    optimized.push(curr);
  }

  return optimized;
}
