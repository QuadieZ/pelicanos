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

function App() {
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [price, setPrice] = useState(0);
  const [prediction, setPrediction] = useState<{
    price: number;
    demand: number;
    revenue: number;
  } | null>({
    price: 0,
    demand: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetch("/top_100_productmaster_translated.json")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setProducts(data);
        setSelectedProduct(data[0]);
        setPrice(data[0].listing_price);
      });
  }, []);

  const productsCollection = createListCollection({
    items: products.map((p: any) => ({
      label: `${p.brand_name} - ${p.shoe_product} - ${p.color_en}`,
      value: p.product_id,
      category: p.product_group_en,
    })),
  });

  const categories = Object.entries(
    groupBy(productsCollection.items, (item) => item.category)
  );

  return (
    <Stack p={16} gap={8}>
      <Heading as="h1">Price Prediction</Heading>
      <Select.Root collection={productsCollection}>
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
        defaultValue={[20, 60]}
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

      <Button colorPalette="orange">Predict Price</Button>

      {prediction && (
        <Stack>
          <Heading as="h2">Prediction</Heading>
          <Text>Optimal Price: {prediction.demand} units</Text>
          <Text>Demand: {prediction.demand} units</Text>
          <Text>Revenue: {prediction.revenue}</Text>
        </Stack>
      )}
    </Stack>
  );
}

export default App;
