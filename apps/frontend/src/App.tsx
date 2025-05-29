import {
  Button,
  createListCollection,
  Heading,
  Portal,
  Select,
  Slider,
  Stack,
  Text,
} from "@chakra-ui/react";
import { groupBy } from "es-toolkit";
import { useEffect, useState } from "react";

interface Product {
  product_id: string;
  brand_name: string;
  shoe_product: string;
  color_en: string;
  product_group_en: string;
  listing_price: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [price, setPrice] = useState(0);
  const [prediction, setPrediction] = useState<{
    price: number;
    demand: number;
    revenue: number;
  } | null>(null);

  useEffect(() => {
    fetch("/top_100_productmaster_translated.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setSelectedProduct(data[0]);
        setPrice(data[0].listing_price);
      });
  }, []);

  const productsCollection = createListCollection({
    items: products.map((p: Product) => ({
      label: `${p.brand_name} - ${p.shoe_product} - ${p.color_en}`,
      value: p.product_id,
      category: p.product_group_en,
    })),
  });

  const categories = Object.entries(
    groupBy(productsCollection.items, (item) => item.category)
  );

  const handleProductSelect = (details: { value: string[] }) => {
    const product = products.find((p) => p.product_id === details.value[0]);
    if (product) {
      setSelectedProduct(product);
      setPrice(product.listing_price);
    }
  };

  const handlePriceRangeChange = (event: React.FormEvent<HTMLDivElement>) => {
    const target = event.target as HTMLInputElement;
    const values = [parseInt(target.value)];
    setPriceRange(values);
    setPrice(values[0]);
  };

  const handlePredict = () => {
    if (selectedProduct) {
      // TODO: Implement actual prediction logic
      setPrediction({
        price: price,
        demand: Math.floor(Math.random() * 1000), // Placeholder
        revenue: price * Math.floor(Math.random() * 1000), // Placeholder
      });
    }
  };

  return (
    <Stack p={16} gap={8}>
      <Heading as="h1">Price Prediction</Heading>
      <Select.Root
        collection={productsCollection}
        onValueChange={handleProductSelect}
      >
        <Select.HiddenSelect />
        <Select.Label>Choose a product</Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select product" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {categories.map(([category, items]) => (
                <Select.ItemGroup key={category}>
                  <Select.ItemGroupLabel>{category}</Select.ItemGroupLabel>
                  {items.map((p) => (
                    <Select.Item item={p} key={p.value}>
                      {p.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.ItemGroup>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      <Slider.Root
        maxW="md"
        value={priceRange}
        onChange={handlePriceRangeChange}
        minStepsBetweenThumbs={8}
        colorPalette="gray"
      >
        <Slider.Label>Select a range of prices</Slider.Label>
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumbs />
        </Slider.Control>
      </Slider.Root>

      <Button colorPalette="orange" onClick={handlePredict}>
        Predict Price
      </Button>

      {prediction && (
        <Stack>
          <Heading as="h2">Prediction</Heading>
          <Text>Optimal Price: {prediction.price} units</Text>
          <Text>Demand: {prediction.demand} units</Text>
          <Text>Revenue: {prediction.revenue}</Text>
        </Stack>
      )}
    </Stack>
  );
}

export default App;
