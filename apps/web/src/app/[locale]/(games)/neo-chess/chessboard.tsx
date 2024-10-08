"use client";

import Tile from './piece';
import React from 'react';
import { useDragAndDrop } from './use-dnd';
import { horizontal, vertical, pieces, PieceType, TeamType } from './pieceSetup';


export default function ChessBoard() {
    const { grabPiece, movePiece, dropPiece, chessboardRef } = useDragAndDrop();

    // Create the board
    let board: React.ReactNode[] = [];

    for (let i = 0; i <= horizontal.length + 1; i++) {
        const row: React.ReactNode[] = [];

        for (let j = 0; j <= vertical.length + 1; j++) {
            let image = undefined;
            let type: PieceType | undefined = undefined;
            let team: TeamType | undefined = undefined;
            let firstMove = false;

            pieces.forEach((piece) => {
                if (piece.x === j && piece.y === i) {
                    image = piece.image;
                    type = piece.type;
                    team = piece.team;
                }
            });

            if (i === 0 || i === horizontal.length + 1) {
                if (j === 0 || j === vertical.length + 1) {
                    row.push(
                        <div className="relative flex aspect-square h-6 items-center justify-center md:h-9 lg:h-12"></div>
                    );
                } else {
                    row.push(
                        <div className="relative flex aspect-square h-6 items-center justify-center md:h-9 lg:h-12">
                            {`${horizontal[j - 1]}`}
                        </div>
                    );
                }
            } else {
                if (j === 0 || j === vertical.length + 1) {
                    row.push(
                        <div className="relative flex aspect-square h-6 items-center justify-center md:h-9 lg:h-12">
                            {`${vertical[vertical.length - i]}`}
                        </div>
                    );
                } else {
                    row.push(
                        (i % 2 !== 0 && j % 2 !== 0) || (i % 2 === 0 && j % 2 === 0) ? (
                            <div className="relative flex aspect-square h-6 items-center justify-center md:h-9 lg:h-12">
                                { image && type && team && (
                                    <Tile id={`${j}, ${i}`} key={`${j}, ${i}`} image={image} type={type} team={team} firstMove={firstMove} />
                                )}
                            </div>
                        ) : (
                            <div className="relative flex aspect-square h-6 items-center justify-center bg-blue-200 md:h-9 lg:h-12">
                                { image && type && team && (
                                    <Tile id={`${j}, ${i}`} key={`${j}, ${i}`} image={image} type={type} team={team} firstMove={firstMove} />
                                )}
                            </div>
                        )
                    );
                }
            }
        }

        board.push(
            <div className="mx-auto grid w-fit grid-cols-10 divide-x">{row}</div>
        );
    }

    return (
        <div className="left-[50%] top-[50%] m-auto grid w-full max-w-sm p-6 sm:rounded-lg md:max-w-4xl lg:max-w-6xl">
            <div className="m-auto flex grid grid-cols-1 items-center justify-center">
                <div className="bg-card text-card-foreground w-full rounded-lg border p-4 shadow-sm md:max-w-fit">
                    <div className="relative divide-y"
                         ref={chessboardRef}
                         onMouseDown={grabPiece}
                         onMouseMove={movePiece}
                         onMouseUp={dropPiece}
                    >
                        {board}
                    </div>
                    <div
                        data-orientation="horizontal"
                        role="none"
                        className="bg-border my-2 h-[1px] w-full shrink-0 md:my-4"
                    ></div>
                    <button className="ring-offset-background focus-visible:ring-ring bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                        Restart
                    </button>
                </div>
            </div>
        </div>
    );
}