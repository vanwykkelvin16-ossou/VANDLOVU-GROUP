/** Original supplied artwork, framed to remove its transparent outer padding. */
export function VehicleIcon({category,size=32}:{category:string;size?:number}) {
  const car=category==='LDV';
  return <svg aria-hidden="true" focusable="false" width={size} height={size}
    viewBox={car?'124 347 831 586':'118 329 898 634'}
    style={{display:'block',flexShrink:0}} preserveAspectRatio="xMidYMid meet">
    <image href={car?'/icons/car.png':'/icons/truck.png'} width="1080" height="1350"/>
  </svg>;
}
