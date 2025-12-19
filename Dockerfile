# Use Java 17 (compatible with Spring Boot)
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose Render's required port
EXPOSE 10000

# Run the jar
CMD ["java", "-jar", "target/*.jar"]
