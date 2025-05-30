import {
  Button,
  createListCollection,
  Heading,
  HStack,
  Portal,
  Select,
  Slider,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { groupBy } from "es-toolkit";
import { useEffect, useState } from "react";

interface Product {
  product_id: string;
  brand_name: string;
  shoe_product: string;
  color: string;
  product_group: string;
  listing_price: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([100, 5000]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<{
    price: number;
    demand: number;
    revenue: number;
  } | null>(null);

  useEffect(() => {
    fetch("/50_products.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts([
          ...new Map(data.map((item) => [item.product_id, item])).values(),
        ] as Product[]);
        setSelectedProduct(data[0].product_id);
      });
  }, []);

  const productsCollection = createListCollection({
    items: products.map((p: Product) => ({
      label: `${p.brand_name} - ${p.shoe_product} - ${p.color ?? ""}`,
      value: p.product_id,
      category: p.product_group,
    })),
  });

  const categories = Object.entries(
    groupBy(productsCollection.items, (item) => item.category)
  );

  const handleProductSelect = (details: { value: string[] }) => {
    const product = products.find((p) => p.product_id === details.value[0]);
    if (product) {
      setSelectedProduct(product.product_id);
    }
  };

  const handlePriceRangeChange = (details: { value: number[] }) => {
    const values = details.value;
    setPriceRange(values);
  };

  const handlePredict = () => {
    if (selectedProduct) {
      setLoading(true);
      axios.post("http://localhost:8000/predict-range", {
        product_id: selectedProduct,
        start_price: priceRange[0],
        end_price: priceRange[1],
      }).then((res) => {
        setPrediction(res.data);
      }).finally(() => {
        setLoading(false);
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
        min={100}
        max={5000}
        step={50}
        value={priceRange}
        onValueChange={handlePriceRangeChange}
        colorPalette="gray"
      >
        <HStack justify="space-between">
          <Slider.Label>Select a range of prices</Slider.Label>
          <Text>
            {priceRange[0]} - {priceRange[1]}
          </Text>
        </HStack>
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
      {loading && <Spinner />}
      {prediction && (
        <Stack>
          <Heading as="h2">Prediction</Heading>
          <Text>Optimal Price: {prediction.price} ฿</Text>
          <Text>Demand: {prediction.demand} units</Text>
          <Text>Revenue: {prediction.revenue} ฿</Text>
        </Stack>
      )}
    </Stack>
  );
}

export default App;
