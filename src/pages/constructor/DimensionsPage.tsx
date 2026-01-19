import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Ruler, Send, Edit, Plus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockOrdersWithCategories = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'ABC Manufacturing',
    categories: [
      {
        id: 'cat1',
        name: 'Steel Frames',
        status: 'Pending',
        dimensions: [
          { id: 'd1', name: 'Main Frame', width: 120, height: 80, depth: 50, quantity: 10 },
          { id: 'd2', name: 'Support Beam', width: 100, height: 20, depth: 20, quantity: 20 },
        ],
      },
      {
        id: 'cat2',
        name: 'Aluminum Panels',
        status: 'DimensionsSet',
        dimensions: [
          { id: 'd3', name: 'Side Panel', width: 200, height: 150, depth: 5, quantity: 8 },
        ],
      },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'XYZ Industries',
    categories: [
      {
        id: 'cat3',
        name: 'Custom Enclosures',
        status: 'Pending',
        dimensions: [],
      },
    ],
  },
];

const getCategoryStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    Pending: 'status-badge status-pending',
    DimensionsSet: 'status-badge status-active',
    InProduction: 'status-badge status-active',
    Completed: 'status-badge status-completed',
  };
  return <span className={variants[status] || 'status-badge'}>{status}</span>;
};

export const DimensionsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Dimensions Management"
        description="Set and manage order dimensions"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Search */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9" />
          </div>
        </div>

        {/* Orders with Categories */}
        <div className="space-y-4">
          {mockOrdersWithCategories.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <CardDescription>{order.customerName}</CardDescription>
                  </div>
                  <Badge variant="outline">{order.categories.length} Categories</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {order.categories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span>{category.name}</span>
                          {getCategoryStatusBadge(category.status)}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Dimensions Table */}
                          {category.dimensions.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-3 font-medium">Name</th>
                                    <th className="text-left py-2 px-3 font-medium">Width (cm)</th>
                                    <th className="text-left py-2 px-3 font-medium">Height (cm)</th>
                                    <th className="text-left py-2 px-3 font-medium">Depth (cm)</th>
                                    <th className="text-left py-2 px-3 font-medium">Qty</th>
                                    <th className="py-2 px-3"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {category.dimensions.map((dim) => (
                                    <tr key={dim.id} className="border-b last:border-0">
                                      <td className="py-2 px-3 font-medium">{dim.name}</td>
                                      <td className="py-2 px-3">{dim.width}</td>
                                      <td className="py-2 px-3">{dim.height}</td>
                                      <td className="py-2 px-3">{dim.depth}</td>
                                      <td className="py-2 px-3">{dim.quantity}</td>
                                      <td className="py-2 px-3">
                                        <Button variant="ghost" size="icon">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">No dimensions set yet.</p>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Dimension
                            </Button>
                            {category.dimensions.length > 0 && category.status === 'Pending' && (
                              <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                                <Send className="mr-2 h-4 w-4" />
                                Notify Production Manager
                              </Button>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
