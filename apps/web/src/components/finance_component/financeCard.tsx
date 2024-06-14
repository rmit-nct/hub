import React from 'react';
import Image from 'next/image';

const FinanceCard = () => {
  return (
    <div className="mt-[100px] text-white ">
      <div className="text-center">
        <h1 className="mb-8 whitespace-nowrap text-3xl font-bold">
          Welcome Finance Department!
        </h1>
        <div className="inline-block rounded-lg p-6">
          <table className="min-w-full  border-collapse border border-white">
            <tbody>
              <tr className="border border-white">
                <td className="flex items-center px-4 py-2 ">
                  <Image
                    src="/media/finance/image.png"
                    alt="Income Icon"
                    width={32}
                    height={32}
                    className="mr-2 inline-block"
                  />
                  <div className="ml-2 border-l border-white pl-2 text-left">
                    <div className="font-bold">Income:</div>
                    <div className="font-bold">-1,333,333 VND</div>
                  </div>
                </td>
              </tr>
              <tr className="border border-white">
                <td className="flex items-center px-4 py-2">
                  <Image
                    src="/media/finance/expense_finance.png"
                    alt="Expense Icon"
                    width={32}
                    height={32}
                    className="mr-2 inline-block"
                  />
                  <div className="ml-2 w-[250px] border-l border-white pl-2 text-left">
                    <div className="font-bold">Expense:</div>
                    <div className="font-bold">1,333,333 VND</div>
                  </div>
                </td>
              </tr>
              <tr className="border border-white">
                <td className="flex items-center px-4 py-2 ">
                  <Image
                    src="/media/finance/total_balance.png"
                    alt="Balance Icon"
                    width={32}
                    height={32}
                    className="mr-2 inline-block"
                  />
                  <div className="ml-2 border-l border-white pl-2 text-left">
                    <div className="font-bold">Total Balance:</div>
                    <div className="font-bold">8,888,888 VND</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <button className="mt-4 w-[200px] rounded-2xl bg-blue-900 px-4 py-2 font-bold text-white hover:bg-blue-600">
            Adjust Amount
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;
