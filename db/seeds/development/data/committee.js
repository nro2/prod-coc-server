module.exports = [
  {
    name: 'Committee on Space Exploration',
    description: 'About exploring space',
    total_slots: 10,
  },
  {
    name: 'Committee on Committees',
    description: 'About committees',
    total_slots: 11,
  },
  { name: 'Committee on athletics', description: 'Sports stuff', total_slots: 12 },
  {
    name: 'Committee for advanced learning',
    description: 'Making folks smart',
    total_slots: 10,
  },
  {
    name: 'Committee on safety',
    description: 'Making people safe',
    total_slots: 12,
  },
  { name: 'Craft brewing committee', description: 'We make beer', total_slots: 10 },
  { name: 'Linux Committee', description: 'Open source stuff', total_slots: 12 },
  { name: 'Gaming Committee', description: 'We play games', total_slots: 10 },
  {
    name: 'Comp Sci Committee',
    description: 'We make apps like this one',
    total_slots: 12,
  },
  { name: 'Student Committee', description: 'We care about you', total_slots: 10 },
  {
    name: 'Test 1 committee slot restrictions',
    description:
      'Checks committee slots remaining >=0  and current faculty committee slots remaining >=0',
    total_slots: 1,
  },
  {
    name: 'Test 2 committee slot restrictions',
    description:
      'Checks committee slots remaining >=0  and current faculty committee slots remaining <0, senate slots <= 0',
    total_slots: 2,
  },
  {
    name: 'Test 3 committee slot restrictions',
    description:
      'Checks committee slots remaining >=0  and current faculty committee slots remaining <0, senate slots > 0 and senate slots <= comm slots remaining',
    total_slots: 3,
  },
  {
    name: 'Test 4 committee slot restrictions',
    description:
      'Checks committee slots remaining >=0  and current faculty committee slots remaining <0, senate slots > 0 and senate slots > comm slots remaining',
    total_slots: 2,
  },
];
