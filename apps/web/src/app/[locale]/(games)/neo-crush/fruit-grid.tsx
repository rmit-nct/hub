// fruit-grid.tsx
import { Fruit, colorMap } from './types';
import { useDragAndDrop } from './use-dnd';
import {
  Bomb,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FruitGridProps {
  fruits: Fruit[];
  setFruits: React.Dispatch<React.SetStateAction<Fruit[]>>;
  handleSpecialFruits: (
    draggedId: number,
    replacedId: number,
    fruits: Fruit[]
  ) => Fruit[];
}

export const FruitGrid: React.FC<FruitGridProps> = ({
  fruits,
  setFruits,
  handleSpecialFruits,
}) => {
  const [squareBeingDragged, setSquareBeingDragged] =
    useState<HTMLDivElement | null>(null);
  const [squareBeingReplaced, setSquareBeingReplaced] =
    useState<HTMLDivElement | null>(null);

  const {
    dragStart,
    dragOver,
    dragLeave,
    dragDrop,
    dragEnd,
    touchStart,
    touchMove,
    touchEnd,
    handleClick,
    isSwiping,
  } = useDragAndDrop(
    fruits,
    setFruits,
    squareBeingDragged,
    squareBeingReplaced,
    setSquareBeingDragged,
    setSquareBeingReplaced,
    handleSpecialFruits
  );

  useEffect(() => {
    if (squareBeingDragged && squareBeingReplaced) {
      dragEnd(null, squareBeingReplaced);
    }
  }, [squareBeingDragged, squareBeingReplaced]);

  return (
    <>
      {/* @ts-ignore */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes special-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <div className="mx-auto grid w-fit grid-cols-8 gap-2 lg:gap-3">
        {fruits.map((fruit, index) => (
          <div
            key={index}
            className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 font-bold text-white shadow-md md:h-8 md:w-8 lg:h-10 lg:w-10 ${
              fruit
                ? fruit?.type !== 'normal'
                  ? ''
                  : 'border-transparent'
                : 'border-foreground/50'
            } ${
              fruit?.type === 'rainbow'
                ? 'bg-gradient-to-br from-red-600 via-violet-400 to-sky-400'
                : ''
            }`}
            style={{
              borderColor:
                (squareBeingDragged &&
                  squareBeingDragged.getAttribute('data-id') ===
                    index.toString()) ||
                (squareBeingReplaced &&
                  squareBeingReplaced.getAttribute('data-id') ===
                    index.toString())
                  ? 'var(--foreground)'
                  : fruit
                    ? fruit?.type === 'rainbow'
                      ? 'var(--foreground)'
                      : fruit?.type !== 'normal'
                        ? colorMap[fruit.color]
                        : 'transparent'
                    : 'var(--foreground)',
              opacity: fruit ? 1 : 0.3,
              backgroundColor:
                fruit?.type === 'rainbow'
                  ? undefined
                  : fruit
                    ? fruit?.type === 'normal'
                      ? colorMap[fruit.color]
                      : // colorMap gives hex color, we need to convert it to rgba
                        `rgba(${parseInt(
                          colorMap[fruit.color].slice(1, 3),
                          16
                        )}, ${parseInt(
                          colorMap[fruit.color].slice(3, 5),
                          16
                        )}, ${parseInt(
                          colorMap[fruit.color].slice(5, 7),
                          16
                        )}, 0.2)`
                    : 'transparent',
              cursor: 'grab',
              backgroundSize: 'auto',
            }}
            data-id={index}
            data-color={fruit?.color as string | undefined}
            data-type={fruit?.type as string | undefined}
            draggable={true}
            onDragStart={dragStart}
            onDragOver={dragOver}
            onDragLeave={dragLeave}
            onDrop={dragDrop}
            onDragEnd={dragEnd}
            onTouchStart={touchStart}
            onTouchMove={touchMove}
            onTouchEnd={touchEnd}
            onClick={(e) => {
              if (!isSwiping.current) {
                handleClick(e);
              }
            }}
          >
            {fruit?.type === 'horizontal' && (
              <>
                <ChevronLeft
                  className="pointer-events-none absolute -left-0.5 h-5 w-5 md:h-6 md:w-6"
                  style={{
                    animation: 'pulse 1s infinite',
                    color: colorMap[fruit.color],
                  }}
                />
                <ChevronRight
                  className="pointer-events-none absolute -right-0.5 h-5 w-5 md:h-6 md:w-6"
                  style={{
                    animation: 'pulse 1s infinite',
                    color: colorMap[fruit.color],
                  }}
                />
              </>
            )}

            {fruit?.type === 'vertical' && (
              <>
                <ChevronUp
                  className="pointer-events-none absolute -top-0.5 h-5 w-5 md:h-6 md:w-6"
                  style={{
                    animation: 'pulse 1s infinite',
                    color: colorMap[fruit.color],
                  }}
                />
                <ChevronDown
                  className="pointer-events-none absolute -bottom-0.5 h-5 w-5 md:h-6 md:w-6"
                  style={{
                    animation: 'pulse 1s infinite',
                    color: colorMap[fruit.color],
                  }}
                />
              </>
            )}

            {fruit?.type === 'rainbow' && (
              <Sparkles className="text-foreground/70 pointer-events-none absolute h-5 w-5 md:h-6 md:w-6" />
            )}

            {fruit?.type === 'explosive' && (
              <Bomb
                className="pointer-events-none absolute h-4 w-4 md:h-6 md:w-6"
                style={{
                  animation: 'pulse 1s infinite',
                  color: colorMap[fruit.color],
                }}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};
