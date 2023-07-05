As mentioned in the introduction, computers are designed to be deterministic, and cannot generate randomness. Hence to generate a random set of numbers, one of the following approaches is used:

  1. Use a physical device (sensor) that captures a natural phenomenon, and convert the readings to digital form.

  2. Use special functions called [Pseudorandom Number Generators](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) to a generate random-looking set of numbers.

The second method is easier and inexpensive, and hence is the most commonly used one. However, if one needs high quality randomness, the first method is often resorted to. One can also use a mixture of the two using measurement of some of the operating system parameters as a seed for randomness. In any case, the random numbers generated will follow a specific distribution. Hence we need to modify the resulting numbers to make it follow the distribution or density function that we desire.

Carefully go through the writeup provided [Here](RandomVariables.pdf).
