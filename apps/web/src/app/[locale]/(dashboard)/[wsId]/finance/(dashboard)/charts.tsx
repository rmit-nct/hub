'use client';

import { cn } from '@repo/ui/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function DailyTotalChart({
  data,
  className,
}: {
  data: {
    day: string;
    total_income: number;
    total_expense: number;
  }[];
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations('transaction-data-table');

  useEffect(() => {
    const chart = document.getElementById('daily-total-chart');
    if (chart) {
      setTimeout(() => {
        chart.scrollTo({
          left: chart.scrollWidth - chart.clientWidth,
          behavior: 'smooth',
        });
      }, 500);
    }
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 overflow-x-auto text-center',
        className
      )}
    >
      <div className="font-semibold">
        {t('daily_total_from_14_recent_days')}
      </div>
      <ResponsiveContainer
        id="daily-total-chart"
        className="grid items-center justify-center overflow-x-auto"
      >
        <BarChart data={data} width={data.length * 75} height={300}>
          <XAxis
            dataKey="day"
            tickFormatter={(value) => {
              return Intl.DateTimeFormat(locale, {
                day: 'numeric',
                month: locale === 'vi' ? 'numeric' : 'short',
              }).format(new Date(value));
            }}
            tick={{ fill: 'hsl(var(--foreground))', opacity: 0.7 }}
          />
          <YAxis
            tickFormatter={(value) => {
              return typeof value === 'number'
                ? Intl.NumberFormat(locale, {
                    style: 'decimal',
                    notation: 'compact',
                  }).format(value)
                : value;
            }}
            tick={{ fill: 'hsl(var(--foreground))', opacity: 0.7 }}
          />
          <Legend />
          <Tooltip
            labelClassName="text-foreground font-semibold"
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--foreground))',
              borderRadius: '0.5rem',
            }}
            separator=": "
            labelFormatter={(value) => {
              return Intl.DateTimeFormat(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(value));
            }}
            formatter={(value, name) => {
              return (
                <span
                  className={cn(
                    name === t('income')
                      ? 'text-dynamic-green'
                      : 'text-dynamic-red'
                  )}
                >
                  {typeof value === 'number'
                    ? Intl.NumberFormat(locale, {
                        style: 'decimal',
                      }).format(value)
                    : value}
                </span>
              );
            }}
            cursor={{ fill: 'hsl(var(--foreground))', opacity: 0.1 }}
          />
          <Bar
            dataKey="total_income"
            fill="hsl(var(--green))"
            name={t('income')}
            minPointSize={1}
          />
          <Bar
            dataKey="total_expense"
            fill="hsl(var(--red))"
            name={t('expense')}
            minPointSize={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyTotalChart({
  data,
  className,
}: {
  data: {
    month: string;
    total_income: number;
    total_expense: number;
  }[];
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations('transaction-data-table');

  useEffect(() => {
    const chart = document.getElementById('monthly-total-chart');
    if (chart) {
      setTimeout(() => {
        chart.scrollTo({
          left: chart.scrollWidth - chart.clientWidth,
          behavior: 'smooth',
        });
      }, 500);
    }
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 overflow-x-auto text-center',
        className
      )}
    >
      <div className="font-semibold">
        {t('monthly_total_from_12_recent_months')}
      </div>
      <ResponsiveContainer
        id="monthly-total-chart"
        className="grid items-center justify-center overflow-x-auto"
      >
        <BarChart data={data} width={data.length * 100} height={300}>
          <XAxis
            dataKey="month"
            tickFormatter={(value) => {
              return Intl.DateTimeFormat(locale, {
                month: locale === 'vi' ? 'numeric' : 'short',
                year: 'numeric',
              }).format(new Date(value));
            }}
            tick={{ fill: 'hsl(var(--foreground))', opacity: 0.7 }}
          />
          <YAxis
            tickFormatter={(value) => {
              return typeof value === 'number'
                ? Intl.NumberFormat(locale, {
                    style: 'decimal',
                    notation: 'compact',
                  }).format(value)
                : value;
            }}
            tick={{ fill: 'hsl(var(--foreground))', opacity: 0.7 }}
          />
          <Legend />
          <Tooltip
            labelClassName="text-foreground font-semibold"
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--foreground))',
              borderRadius: '0.5rem',
            }}
            separator=": "
            labelFormatter={(value) => {
              return Intl.DateTimeFormat(locale, {
                month: 'long',
                year: 'numeric',
              }).format(new Date(value));
            }}
            formatter={(value, name) => {
              return (
                <span
                  className={cn(
                    name === t('income')
                      ? 'text-dynamic-green'
                      : 'text-dynamic-red'
                  )}
                >
                  {typeof value === 'number'
                    ? Intl.NumberFormat(locale, {
                        style: 'decimal',
                      }).format(value)
                    : value}
                </span>
              );
            }}
            cursor={{ fill: 'hsl(var(--foreground))', opacity: 0.1 }}
          />
          <Bar
            dataKey="total_income"
            fill="hsl(var(--green))"
            name={t('income')}
            minPointSize={1}
          />
          <Bar
            dataKey="total_expense"
            fill="hsl(var(--red))"
            name={t('expense')}
            minPointSize={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
