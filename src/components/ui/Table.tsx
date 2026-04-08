import React from 'react';
import { cn } from '../../lib/utils';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}
interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}
interface TableHeadCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table
        ref={ref}
        className={cn("w-full text-left text-sm whitespace-nowrap", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100", className)}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("divide-y divide-slate-100 font-medium bg-white", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("hover:bg-slate-50 transition-colors", className)}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadCellProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn("px-6 py-4", className)}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("px-6 py-4", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

export default Table;
